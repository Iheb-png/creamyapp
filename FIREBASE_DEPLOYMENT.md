# Firebase Deployment Guide for CreamyApp

This guide will help you deploy your CreamyOCR application to Firebase for completely free hosting.

## Prerequisites

1. **Firebase Account**: Create an account at [Firebase Console](https://console.firebase.google.com/)
2. **Firebase CLI**: Install the Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```
3. **Python Dependencies**: Tesseract OCR and spaCy models need to be available in Firebase Functions

## Step 1: Create Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter your project name (e.g., "creamyapp")
4. IMPORTANT: Choose the "Blaze" plan (pay-as-you-go) - this is required for Python Functions
5. Complete the project setup

## Step 2: Initialize Firebase Project

1. Copy your Project ID from the Firebase Console (it's shown in the project settings)
2. Replace all instances of `{your-project-id}` in the codebase with your actual project ID

3. Log in to Firebase:
```bash
firebase login
```

4. Initialize Firebase in your project directory:
```bash
firebase init
```
- Select: `Functions` and `Hosting`
- Choose your existing project
- Select Python as the functions language
- Choose default locations for everything

## Step 3: Set Up Firebase Services

### Enable Firestore
1. Go to Firestore in your Firebase Console
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose one close to your users)

### Enable Storage
1. Go to Storage in your Firebase Console
2. Click "Get started"
3. Choose "Start in test mode"
4. Set up security rules (optional for testing)

## Step 4: Configure Environment Variables

1. Create a `.env.production` file for production environment:
```bash
# .env.production
VITE_FB_PROJECT_ID=your-project-id
VITE_FB_API_KEY=your-firebase-api-key
VITE_FB_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FB_STORAGE_BUCKET=your-project-id.appspot.com
```

2. Update the Firebase Functions configuration:
   - In `firebase.json`, replace `{your-project-id}` with your actual project ID
   - In `functions/main.py`, replace `{your-project-id}` with your actual project ID
   - In all frontend components, replace `{your-project-id}` with your actual project ID

## Step 5: Configure Python Function Dependencies

The `functions/requirements.txt` already includes all necessary packages for Python Cloud Functions:

- `firebase-admin` - Firebase SDK
- `flask` - Web framework
- `flask-cors` - CORS handling
- `Pillow` - Image processing
- `pytesseract` - OCR engine
- `spacy` - NLP processing
- `de-core-news-sm` - German language model

## Step 6: Build and Deploy

### For Testing (Emulator)

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, build frontend for testing
cd frontend
npm run build
cd -
```

### For Production Deployment

1. **Build the Frontend**:
```bash
cd frontend
npm run build
cd -
```

2. **Deploy to Firebase**:
```bash
# Deploy everything
firebase deploy

# Or deploy separately:
firebase deploy --only functions
firebase deploy --only hosting
```

## Step 7: Configure CORS and Security

### Functions CORS
The functions code already includes CORS headers, but you can configure them in Firebase Console if needed.

### Storage Security Rules
Create basic storage rules (rules/firestore.rules):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploaded_images/{allPaths=**} {
      allow read, write: if request.auth != null || true; // Allow for testing
    }
  }
}
```

### Firestore Security Rules
Create basic firestore rules (firestore.rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null || true; // Allow for testing
    }
  }
}
```

## Step 8: Verify Deployment

1. **Check Functions**: Visit your Firebase Console → Functions to see your deployed function
2. **Check Hosting**: Your app should be live at `https://your-project-id.web.app`
3. **Test OCR Upload**: Try uploading an image to verify OCR processing works
4. **Check Logs**: Use Firebase Console to view function logs if there are issues

## Monitoring and Maintenance

### Free Tier Limits
- **Functions**: 2M monthly invocations, 400,000 GB-seconds compute time
- **Storage**: 5GB storage, 1GB/day downloads
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day, 20K deletes/day

### Cost Monitoring
1. Go to Firebase Console → Billing
2. Monitor your usage to stay within free limits

### Scaling Considerations
- If you exceed free limits, the app will still work but you'll incur costs
- Consider upgrading to Flame plan if usage grows significantly

## Troubleshooting

### Common Issues

1. **Tesseract Not Found**: Ensure Python Cloud Functions can install pillow and pytesseract
2. **spaCy Model Missing**: The German model should be included in requirements.txt
3. **Firebase Auth Errors**: Check that your API key and project ID are correct
4. **CORS Issues**: Functions should handle CORS automatically with the current setup

### Logs and Debugging
```bash
# View function logs
firebase functions:log

# Check deployment status
firebase projects:list
```

## Architecture Overview

- **Frontend**: React + Vite, built with Material-UI, deployed to Firebase Hosting
- **Backend**: Python Flask app running as Firebase Functions
- **Database**: Firestore (NoSQL database)
- **Storage**: Firebase Storage for image files
- **OCR**: Tesseract OCR engine with German language support
- **NLP**: spaCy with German language model for text analysis

## Customization

### Adding More Languages
1. Update pytesseract language in the OCR function
2. Install additional spaCy language models in requirements.txt

### Custom Security Rules
Modify firestore.rules and storage.rules for production security

### Environment Variables
Add more environment variables in Firebase Console > Functions > Configuration

---

## Quick Deploy Command

For the impatient:

### Windows Users (Batch Script):
```cmd
# Replace YOUR_PROJECT_ID with your actual Firebase project ID
deploy.bat YOUR_PROJECT_ID
```

### Linux/Mac Users (Bash Script):
```bash
# Replace YOUR_PROJECT_ID with your actual Firebase project ID
./deploy.sh YOUR_PROJECT_ID
```

### Manual Deployment (All Platforms):
```bash
# Replace YOUR_PROJECT_ID with your actual Firebase project ID
sed -i 's/{your-project-id}/YOUR_PROJECT_ID/g' firebase.json functions/main.py frontend/src/App.jsx frontend/src/components/Gallery.jsx frontend/src/components/DetailsOverlay.jsx # (Linux/Mac)
# OR use PowerShell on Windows: Get-Content file.txt | ForEach-Object { $_ -replace '{your-project-id}', 'YOUR_PROJECT_ID' } | Set-Content file.txt

firebase login
firebase deploy
```

Your CreamyOCR app will be live at `https://YOUR_PROJECT_ID.web.app`!
