#!/bin/bash

# SOG Kneeboard - GitHub Push Script
# This script initializes git in the project folder and pushes to GitHub

echo "═══════════════════════════════════════════════════════"
echo "  SOG KNEEBOARD - GITHUB PUSH SCRIPT"
echo "═══════════════════════════════════════════════════════"
echo ""

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Must run from sog-kneeboard directory"
    echo "   cd /Users/conradweeden/sog-kneeboard"
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Check if git is already initialized
if [ -d ".git" ]; then
    echo "✅ Git already initialized"
else
    echo "🔧 Initializing git repository..."
    git init
    git remote add origin https://github.com/SingSongScreamAlong/sog-kneeboard.git
    echo "✅ Git initialized"
fi

echo ""
echo "📝 Adding files to git..."
git add .

echo ""
echo "📊 Files to be committed:"
git status --short

echo ""
read -p "Continue with commit? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "💾 Creating commit..."
    git commit -m "Complete SOG Kneeboard implementation

- Add bridge tool for Arma 3 communication
- Implement all SQF scripts for mod functionality
- Add comprehensive documentation suite
- Update dependencies (axios, concurrently)
- Add NPM scripts for easy operation
- Project now fully operational"

    echo ""
    echo "🚀 Pushing to GitHub..."
    
    # Try to push, handling both new and existing repos
    if git push -u origin main 2>/dev/null; then
        echo "✅ Pushed to main branch"
    elif git push -u origin master 2>/dev/null; then
        echo "✅ Pushed to master branch"
    else
        echo "⚠️  Push failed. You may need to:"
        echo "   1. Set the branch: git branch -M main"
        echo "   2. Pull first: git pull origin main --rebase"
        echo "   3. Then push: git push origin main"
        echo ""
        echo "Or run these commands manually:"
        echo "   git branch -M main"
        echo "   git push -u origin main --force"
    fi
    
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "✅ DONE!"
    echo "═══════════════════════════════════════════════════════"
    echo ""
    echo "🌐 View on GitHub:"
    echo "   https://github.com/SingSongScreamAlong/sog-kneeboard"
    echo ""
    echo "📥 Clone on Windows PC:"
    echo "   git clone https://github.com/SingSongScreamAlong/sog-kneeboard.git"
    echo ""
else
    echo ""
    echo "❌ Cancelled"
fi
