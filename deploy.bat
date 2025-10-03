@echo off

REM Firebase Deployment Batch Script for CreamyApp
REM Usage: deploy.bat YOUR_PROJECT_ID

setlocal enabledelayedexpansion

if "%1"=="" (
    echo Usage: deploy.bat YOUR_PROJECT_ID
    echo Example: deploy.bat my-creamyapp-project
    goto :end
)

set PROJECT_ID=%1

echo 🚀 Starting Firebase deployment for project: %PROJECT_ID%

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase CLI is not installed. Please install it with: npm install -g firebase-tools
    goto :end
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if errorlevel 1 (
    echo 🔐 Please login to Firebase first by running: firebase login
    goto :end
)

REM Replace project ID placeholders in all files
echo 🔧 Configuring project ID: %PROJECT_ID%

REM Backend configuration
powershell -Command "(gc functions/main.py) -replace '{your-project-id}', '%PROJECT_ID%' | Out-File -encoding ASCII functions/main.py"
powershell -Command "(gc firebase.json) -replace '{your-project-id}', '%PROJECT_ID%' | Out-File -encoding ASCII firebase.json"

REM Frontend configuration
powershell -Command "(gc frontend/src/App.jsx) -replace '{your-project-id}', '%PROJECT_ID%' | Out-File -encoding ASCII frontend/src/App.jsx"
powershell -Command "(gc frontend/src/components/Gallery.jsx) -replace '{your-project-id}', '%PROJECT_ID%' | Out-File -encoding ASCII frontend/src/components/Gallery.jsx"
powershell -Command "(gc frontend/src/components/DetailsOverlay.jsx) -replace '{your-project-id}', '%PROJECT_ID%' | Out-File -encoding ASCII frontend/src/components/DetailsOverlay.jsx"

echo 📦 Building frontend...
cd frontend
call npm run build
cd ..

echo 🔥 Deploying to Firebase...
firebase use %PROJECT_ID%

REM Deploy functions first (they need more setup time)
echo 📤 Deploying Functions...
firebase deploy --only functions

REM Deploy hosting
echo 🌐 Deploying Hosting...
firebase deploy --only hosting

echo.
echo ✅ Deployment completed!
echo.
echo 🌍 Your CreamyOCR app is now live at:
echo    https://%PROJECT_ID%.web.app
echo.
echo 🔗 Functions API URL:
echo    https://us-central1-%PROJECT_ID%.cloudfunctions.net/creamyapp
echo.
echo 📊 Check your Firebase Console:
echo    https://console.firebase.google.com/project/%PROJECT_ID%
echo.
echo 📝 Next steps:
echo    1. Enable Firestore and Storage in your Firebase Console
echo    2. Test the app by uploading an image
echo    3. Monitor usage in Firebase Console ^> Billing
echo.
echo ⚠️  Note: Using free tier limits:
echo    - Firebase Functions: 2M invocations/month
echo    - Firebase Storage: 5GB
echo    - Firestore: 1GB data, 50K reads/day
echo.
echo 🎉 Happy OCR'ing!

:end
