# This script helps set up the minimal environment for CreamyApp
# Run: python setup.py
import os
import subprocess


def install_spacy_model():
    try:
        import spacy
        subprocess.run(['python', '-m', 'spacy', 'download', 'de_core_news_sm'], check=True)
    except Exception as e:
        print('spaCy not installed or error:', e)

if __name__ == '__main__':
    print('Installing spaCy German model...')
    install_spacy_model()
    print('Done.')
    print('Make sure Tesseract OCR is installed and in your PATH.')
