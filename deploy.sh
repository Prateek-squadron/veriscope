#!/bin/bash
# VeriScope Deployment Script
# Run this script to deploy your application

echo "🚀 VeriScope Deployment Script"
echo "==============================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial deployment setup"
else
    echo "✅ Git repository already initialized"
fi

# Check for GitHub remote
if ! git remote | grep -q "origin"; then
    echo "⚠️  Please add your GitHub remote manually:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/veriscope.git"
    echo "   git push -u origin main"
else
    echo "📤 Pushing latest changes to GitHub..."
    git add .
    git commit -m "Deployment configuration updates $(date)"
    git push origin main
    echo "✅ Code pushed to GitHub"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Set up MongoDB Atlas (see DEPLOYMENT.md)"
echo "2. Deploy backend to Render"
echo "3. Deploy frontend to Vercel"
echo "4. Update environment variables"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"