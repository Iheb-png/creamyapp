
from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import io
import spacy
from collections import Counter
import sqlite3
import os
import requests
from unidecode import unidecode

app = Flask(__name__)
CORS(app)

# Utility: Translate German word to English using MyMemory API (free, limited)
def translate_word(word):
    try:
        url = f"https://api.mymemory.translated.net/get?q={word}&langpair=de|en"
        resp = requests.get(url, timeout=5)
        data = resp.json()
        return data['responseData']['translatedText']
    except Exception:
        return ''

# Endpoint: Get most used words across all uploads with English translation
@app.route('/top_words', methods=['GET'])
def top_words():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT text FROM uploads')
    all_texts = ' '.join(row[0] for row in c.fetchall())
    conn.close()
    doc = nlp(all_texts)
    # Use lemma and ASCII normalization for grouping (Studie, Studierende -> studie)
    words = [unidecode(token.lemma_.lower()) for token in doc if token.is_alpha and not token.is_stop]
    freq = Counter(words).most_common(30)
    result = []
    for word, count in freq:
        translation = translate_word(word)
        result.append({'word': word, 'count': count, 'translation': translation})
    return jsonify({'top_words': result})


# Load spaCy German small model
try:
    nlp = spacy.load('de_core_news_sm')
except OSError:
    raise RuntimeError('spaCy German model not found. Run: python -m spacy download de_core_news_sm')


# SQLite setup
DB_PATH = 'creamyapp.db'
UPLOAD_FOLDER = 'uploaded_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS uploads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT,
        filename TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()
init_db()

# Endpoint: List all uploaded images and their extracted text
@app.route('/uploads', methods=['GET'])
def list_uploads():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT id, text, filename, created_at FROM uploads ORDER BY id DESC')
    uploads = [
        {
            'id': row[0],
            'text': row[1][:200],
            'filename': row[2],
            'created_at': row[3]
        } for row in c.fetchall()
    ]
    conn.close()
    return jsonify({'uploads': uploads})

from flask import send_from_directory

# OCR image upload endpoint (POST)
@app.route('/ocr', methods=['POST'])
def ocr_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    # Save image to disk
    filename = image.filename
    save_path = os.path.join(UPLOAD_FOLDER, filename)
    image.save(save_path)
    img = Image.open(save_path)
    text = pytesseract.image_to_string(img, lang='deu')
    # Save to DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('INSERT INTO uploads (text, filename) VALUES (?, ?)', (text, filename))
    conn.commit()
    conn.close()
    return jsonify({'text': text})

# OCR fetch endpoint (GET)
@app.route('/ocr', methods=['GET'])
def get_ocr_for_image():
    filename = request.args.get('filename')
    if not filename:
        return jsonify({'error': 'No filename provided'}), 400
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT text FROM uploads WHERE filename = ?', (filename,))
    row = c.fetchone()
    conn.close()
    if not row:
        return jsonify({'error': 'No OCR found for this image'}), 404
    text = row[0]
    # Analyze top words for this text
    doc = nlp(text)
    words = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
    freq = Counter(words).most_common(20)
    return jsonify({'text': text, 'top_words': freq})
from flask import send_from_directory

# Serve uploaded images
@app.route('/uploaded_images/<filename>')
def uploaded_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.get_json()
    text = data.get('text', '')
    doc = nlp(text)
    words = [token.text.lower() for token in doc if token.is_alpha and not token.is_stop]
    freq = Counter(words).most_common(20)
    # Grammar patterns (German)
    verbs = [token.lemma_ for token in doc if token.pos_ == 'VERB']
    preps = [token.text for token in doc if token.pos_ == 'ADP']
    sentences = [sent.text for sent in doc.sents]
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
        doc = nlp(sent)
        # Fill-in-the-blank for verbs
        for token in doc:
            if token.pos_ == 'VERB':
                blanked = sent.replace(token.text, '____', 1)
                exercises.append({'type': 'fill_blank', 'question': blanked, 'answer': token.text})
                break
    return jsonify({'exercises': exercises})


# Endpoint: Delete a single upload by ID
@app.route('/uploads/<int:upload_id>', methods=['DELETE'])
def delete_upload(upload_id):
    # Get filename before deletion
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('SELECT filename FROM uploads WHERE id = ?', (upload_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Upload not found'}), 404

    filename = row[0]

    # Delete from DB
    c.execute('DELETE FROM uploads WHERE id = ?', (upload_id,))
    conn.commit()
    conn.close()

    # Delete file if exists
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {filename}: {e}")

    return jsonify({'status': 'upload deleted'})

# Endpoint: Delete all uploads and images
@app.route('/uploads/all', methods=['DELETE'])
def delete_all_uploads():
    # Delete all DB records
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('DELETE FROM uploads')
    conn.commit()
    conn.close()
    # Delete all files in upload folder
    for fname in os.listdir(UPLOAD_FOLDER):
        fpath = os.path.join(UPLOAD_FOLDER, fname)
        if os.path.isfile(fpath):
            try:
                os.remove(fpath)
            except Exception:
                pass
    return jsonify({'status': 'all uploads deleted'})

if __name__ == '__main__':
    app.run(debug=True)
