import firebase_admin
from firebase_admin import credentials, firestore, storage
from flask_cors import CORS
import pytesseract
from PIL import Image
import io
import spacy
from collections import Counter
import requests
from unidecode import unidecode
import base64
from flask import Flask, request, jsonify
import tempfile
import os

# Initialize Firebase
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred, {
    'storageBucket': '{your-project-id}.appspot.com'  # Replace with your Firebase project ID
})

db = firestore.client()
bucket = storage.bucket()

app = Flask(__name__)
CORS(app)

# Utility: Translate German word to English
def translate_word(word):
    try:
        url = f"https://api.mymemory.translated.net/get?q={word}&langpair=de|en"
        resp = requests.get(url, timeout=5)
        data = resp.json()
        return data['responseData']['translatedText']
    except Exception:
        return ''

# Load spaCy German model
try:
    nlp = spacy.load('de_core_news_sm')
except OSError:
    nlp = None

# Endpoint: Get most used words (Firestore)
@app.route('/top_words', methods=['GET'])
def top_words():
    docs = db.collection('uploads').stream()
    all_texts = ''
    for doc in docs:
        data = doc.to_dict()
        all_texts += data.get('text', '') + ' '

    if not all_texts.strip():
        return jsonify({'top_words': []})

    doc = nlp(all_texts)
    words = [unidecode(token.lemma_.lower()) for token in doc
             if token.is_alpha and not token.is_stop]
    freq = Counter(words).most_common(30)
    result = []
    for word, count in freq:
        translation = translate_word(word)
        result.append({'word': word, 'count': count, 'translation': translation})
    return jsonify({'top_words': result})

# Endpoint: List all uploaded images (Firestore)
@app.route('/uploads', methods=['GET'])
def list_uploads():
    docs = db.collection('uploads').order_by('created_at', direction=firestore.Query.DESCENDING).stream()

    uploads = []
    for doc in docs:
        data = doc.to_dict()
        uploads.append({
            'id': doc.id,
            'text': data.get('text', '')[:200],
            'filename': data.get('filename', ''),
            'created_at': data.get('created_at').isoformat() if data.get('created_at') else None
        })

    return jsonify({'uploads': uploads})

# OCR image upload endpoint (Firebase Storage + Firestore)
@app.route('/ocr', methods=['POST'])
def ocr_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image_file = request.files['image']
    filename = image_file.filename

    # Save temporarily for OCR processing
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as temp_file:
        image_file.save(temp_file.name)
        temp_path = temp_file.name

    try:
        img = Image.open(temp_path)
        text = pytesseract.image_to_string(img, lang='deu')

        # Upload to Firebase Storage
        storage_path = f"uploaded_images/{filename}"
        blob = bucket.blob(storage_path)
        with open(temp_path, 'rb') as f:
            blob.upload_from_file(f, content_type=image_file.content_type)

        # Save to Firestore
        doc_ref = db.collection('uploads').add({
            'filename': filename,
            'text': text,
            'created_at': firestore.SERVER_TIMESTAMP
        })

        return jsonify({'text': text})

    finally:
        os.unlink(temp_path)

# OCR fetch endpoint (GET)
@app.route('/ocr', methods=['GET'])
def get_ocr_for_image():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'error': 'No filename provided'}), 400

    docs = db.collection('uploads').where('filename', '==', filename).limit(1).stream()
    doc = next(docs, None)

    if not doc:
        return jsonify({'error': 'No OCR found for this image'}), 404

    data = doc.to_dict()
    text = data.get('text', '')

    # Analyze top words
    doc_obj = nlp(text)
    words = [token.text.lower() for token in doc_obj if token.is_alpha and not token.is_stop]
    freq = Counter(words).most_common(20)

    return jsonify({'text': text, 'top_words': freq})

# Serve uploaded images from Firebase Storage
@app.route('/uploaded_images/<filename>')
def uploaded_image(filename):
    blob = bucket.blob(f"uploaded_images/{filename}")
    image_data = blob.download_as_bytes()
    return image_data, 200, {'Content-Type': 'image/jpeg' if '.jpg' in filename.lower() or '.jpeg' in filename.lower() else 'image/png'}

@app.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.get_json()
    text = data.get('text', '')

    if not text:
        return jsonify({
            'word_freq': [],
            'verbs': [],
            'prepositions': [],
            'sentences': []
        })

    doc = nlp(text)
    words = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
    freq = Counter(words).most_common(20)

    sentences = [sent.text for sent in doc.sents]
    verbs = [token.lemma_ for token in doc if token.pos_ == 'VERB']
    preps = [token.text for token in doc if token.pos_ == 'ADP']

    return jsonify({
        'word_freq': freq,
        'verbs': verbs,
        'prepositions': preps,
        'sentences': sentences
    })

@app.route('/exercise', methods=['POST'])
def generate_exercise():
    data = request.get_json()
    sentences = data.get('sentences', [])
    exercises = []

    for sent in sentences:
        if nlp:
            doc = nlp(sent)
            for token in doc:
                if token.pos_ == 'VERB':
                    blanked = sent.replace(token.text, '____', 1)
                    exercises.append({
                        'type': 'fill_blank',
                        'question': blanked,
                        'answer': token.text
                    })
                    break

    return jsonify({'exercises': exercises})

# Delete single upload by ID
@app.route('/uploads/<upload_id>', methods=['DELETE'])
def delete_upload(upload_id):
    # Get document data
    doc_ref = db.collection('uploads').document(upload_id)
    doc = doc_ref.get()

    if not doc.exists:
        return jsonify({'error': 'Upload not found'}), 404

    data = doc.to_dict()
    filename = data.get('filename')

    # Delete from Firestore
    doc_ref.delete()

    # Delete from Storage
    if filename:
        blob = bucket.blob(f"uploaded_images/{filename}")
        if blob.exists():
            blob.delete()

    return jsonify({'status': 'upload deleted'})

# Delete all uploads (for cleanup)
@app.route('/uploads/all', methods=['DELETE'])
def delete_all_uploads():
    # Delete all documents
    docs = db.collection('uploads').stream()
    deleted_count = 0

    for doc in docs:
        data = doc.to_dict()
        filename = data.get('filename')

        # Delete from Storage
        if filename:
            blob = bucket.blob(f"uploaded_images/{filename}")
            if blob.exists():
                blob.delete()

        # Delete from Firestore
        doc.reference.delete()
        deleted_count += 1

    return jsonify({'status': f'{deleted_count} uploads deleted'})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response
