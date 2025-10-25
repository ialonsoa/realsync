#!/bin/bash

# RealSync - Quick Deploy Script
# This script helps you deploy RealSync to Vercel

echo "🚀 RealSync Deployment Script"
echo "=============================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Git repository not found!"
    echo "Run: git init"
    exit 1
fi

echo "✅ Git repository found"

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "📝 GitHub Setup Required"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to: https://github.com/new"
    echo "2. Create a repository named 'realsync'"
    echo "3. Copy your repository URL"
    echo ""
    read -p "Enter your GitHub repository URL: " repo_url

    git remote add origin "$repo_url"
    echo "✅ Remote added: $repo_url"
else
    echo "✅ GitHub remote already configured"
fi

# Push to GitHub
echo ""
echo "📤 Pushing code to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully!"
else
    echo "⚠️  Push failed. You may need to:"
    echo "   - Authenticate with GitHub"
    echo "   - Or run: git push -u origin main --force"
    exit 1
fi

echo ""
echo "🎉 Success! Your code is on GitHub!"
echo ""
echo "Next steps:"
echo "1. Go to: https://vercel.com/new"
echo "2. Import your 'realsync' repository"
echo "3. Set Root Directory to: frontend/web"
echo "4. Click Deploy!"
echo ""
echo "📖 For detailed instructions, see: DEPLOY_NOW.md"
echo ""
