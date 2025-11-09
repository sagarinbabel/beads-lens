# GitHub Repository Setup

## Option 1: Using GitHub CLI (if installed)

```bash
# Create repository on GitHub
gh repo create beads-lens --public --source=. --remote=origin --push

# Or if you want it private:
gh repo create beads-lens --private --source=. --remote=origin --push
```

## Option 2: Manual Setup

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `beads-lens`
3. Choose Public or Private
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click "Create repository"

### Step 2: Add Remote and Push
```bash
# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/beads-lens.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Option 3: Using SSH (if you have SSH keys set up)

```bash
# Add SSH remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin git@github.com:YOUR_USERNAME/beads-lens.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## After Pushing

Once pushed, you can:
- View your repository at: `https://github.com/YOUR_USERNAME/beads-lens`
- Clone it elsewhere: `git clone https://github.com/YOUR_USERNAME/beads-lens.git`
- Share it with others

## Next Steps

1. Update the repository description on GitHub
2. Add topics/tags: `chrome-extension`, `beads`, `project-management`, `typescript`, `go`
3. Create a README.md in the root (if you want one)
4. Set up GitHub Actions for CI/CD (optional)

