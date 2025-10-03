# CreamyApp: Minimal OCR & Grammar Analysis Web App

## Features
- Upload images of book/paper pages
- Extract text using Tesseract OCR
- Analyze vocabulary (word frequency)
- Detect basic grammar patterns (POS, verbs, prepositions)
- Generate simple grammar exercises (fill-in-the-blank, etc.)
- All local, free, and lightweight

## Stack
- Backend: Python (Flask), pytesseract, spaCy (small model), SQLite
- Frontend: HTML/JS (no framework)

## Usage
1. Start the backend: `python app.py` in the backend folder
2. Open `index.html` in the frontend folder

## Requirements
- Python 3.8+
- Tesseract OCR installed (https://github.com/tesseract-ocr/tesseract)
- Python packages: Flask, pytesseract, spacy

## Notes
- Designed for low-resource machines
- No paid services or cloud APIs
