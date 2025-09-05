@echo off
echo 🚀 VeriScope Deployment Script
echo ===============================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo 📝 Initializing Git repository...
    git init
    git add .
    git commit -m "Initial deployment setup"
) else (
    echo ✅ Git repository already initialized
)

echo.
echo 📤 Preparing for deployment...
git add .
git status

echo.
echo 🎯 Next Steps:
echo 1. Commit your changes: git commit -m "Deployment ready"
echo 2. Push to GitHub: git push origin main  
echo 3. Set up MongoDB Atlas (see DEPLOYMENT.md)
echo 4. Deploy backend to Render
echo 5. Deploy frontend to Vercel
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
echo.
pause