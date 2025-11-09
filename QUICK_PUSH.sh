#!/bin/bash
# Quick push script - Replace YOUR_USERNAME with your GitHub username

USERNAME="${1:-YOUR_USERNAME}"  # Get username from command line argument
REPO="beads-lens"

echo "Setting up remote and pushing to GitHub..."
echo "Username: $USERNAME"
echo ""

# Remove existing remote if any
git remote remove origin 2>/dev/null

# Add remote
git remote add origin "https://github.com/$USERNAME/$REPO.git"

# Push
git branch -M main
git push -u origin main

echo ""
echo "If push failed, make sure:"
echo "  1. Repository exists at: https://github.com/$USERNAME/$REPO"
echo "  2. You're authenticated (GitHub may prompt for credentials)"
echo "  3. Repository is empty or you have force push permissions"

