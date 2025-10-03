#!/bin/bash

# Firebase Deployment Script for CreamyApp
# Usage: ./deploy.sh YOUR_PROJECT_ID

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 YOUR_PROJECT_ID"
    echo "Example: $0 my-creamyapp-project"
    exit 1
fi

PROJECT_ID=$1

echo "🚀 Starting Firebase deployment for project: $PROJECT_ID"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase first:"
    firebase login
fi

# Replace project ID placeholders in all files
echo "🔧 Configuring project ID: $PROJECT_ID"

# Backend configuration
sed -i.bak "s/{your-project-id}/$PROJECT_ID/g" functions/main.py
sed -i.bak "s/{your-project-id}/$PROJECT_ID/g" firebase.json

# Frontend configuration
sed -i.bak "s/{your-project-id}/$PROJECT_ID/g" frontend/src/App.jsx
sed -i.bak "s/{your-project-id}/$PROJECT_ID/g" frontend/src/components/Gallery.jsx
sed -i.bak "s/{your-project-id}/$PROJECT_ID/g" frontend/src/components/DetailsOverlay.jsx

echo "📦 Building frontend..."
cd frontend
npm run build
cd -

echo "🔥 Deploying to Firebase..."
firebase use $PROJECT_ID

# Deploy functions first (they need more setup time)
echo "📤 Deploying Functions..."
firebase deploy --only functions

# Deploy hosting
echo "🌐 Deploying Hosting..."
firebase deploy --only hosting

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🌍 Your CreamyOCR app is now live at:"
echo "   https://$PROJECT_ID.web.app"
echo ""
echo "🔗 Functions API URL:"
echo "   https://us-central1-$PROJECT_ID.cloudfunctions.net/creamyapp"
echo ""
echo "📊 Check your Firebase Console:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID"
echo ""
echo "📝 Next steps:"
echo "   1. Enable Firestore and Storage in your Firebase Console"
echo "   2. Test the app by uploading an image"
echo "   3. Monitor usage in Firebase Console > Billing"
echo ""
echo "⚠️  Note: Using free tier limits:"
echo "   - Firebase Functions: 2M invocations/month"
echo "   - Firebase Storage: 5GB"
echo "   - Firestore: 1GB data, 50K reads/day"
echo ""
echo "🎉 Happy OCR'ing!"
