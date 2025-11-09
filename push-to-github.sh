#!/bin/bash

# Script to push beads-lens to GitHub
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME

if [ -z "$1" ]; then
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME"
    echo "Example: ./push-to-github.sh sagar"
    exit 1
fi

USERNAME=$1
REPO_NAME="beads-lens"

echo "Setting up GitHub remote for $REPO_NAME..."
echo ""

# Check if remote already exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "Remote 'origin' already exists. Removing it first..."
    git remote remove origin
fi

# Add remote
echo "Adding remote: https://github.com/$USERNAME/$REPO_NAME.git"
git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"

# Ensure we're on main branch
git branch -M main

# Push
echo ""
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "📍 Repository: https://github.com/$USERNAME/$REPO_NAME"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   1. You've created the repository on GitHub first"
    echo "   2. The repository name matches: $REPO_NAME"
    echo "   3. You have push permissions"
    echo ""
    echo "Create the repo at: https://github.com/new"
    echo "   Name: $REPO_NAME"
    echo "   Don't initialize with README, .gitignore, or license"
fi

