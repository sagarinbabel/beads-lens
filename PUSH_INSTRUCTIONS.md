# Push to GitHub - Instructions

## Step 1: Create the Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `beads-lens`
3. Choose **Public** or **Private**
4. **IMPORTANT**: Do NOT check "Initialize this repository with a README"
5. Click "Create repository"

## Step 2: Push Using One of These Methods

### Option A: Using Personal Access Token (Recommended)

1. Create a Personal Access Token:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a name like "beads-lens-push"
   - Select scope: `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. Push using the token:
   ```bash
   cd /Users/sagar/Downloads/projects/beads-lens
   git push -u origin main
   ```
   
   When prompted:
   - Username: `sagarinbabel`
   - Password: **Paste your personal access token** (not your GitHub password)

### Option B: Using GitHub CLI

1. Install GitHub CLI (if not installed):
   ```bash
   brew install gh
   ```

2. Authenticate:
   ```bash
   gh auth login
   ```

3. Push:
   ```bash
   git push -u origin main
   ```

### Option C: Using GitHub Desktop

1. Install GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository
4. Select: `/Users/sagar/Downloads/projects/beads-lens`
5. Click "Publish repository"

### Option D: Set up SSH Keys (for future)

1. Generate SSH key:
   ```bash
   ssh-keygen -t ed25519 -C "sagardubey@gmail.com"
   ```

2. Add to SSH agent:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_ed25519
   ```

3. Copy public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. Add to GitHub:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your public key
   - Click "Add SSH key"

5. Change remote to SSH:
   ```bash
   git remote set-url origin git@github.com:sagarinbabel/beads-lens.git
   git push -u origin main
   ```

## Quick Command (After Creating Repo)

```bash
cd /Users/sagar/Downloads/projects/beads-lens
git push -u origin main
```

Then enter your credentials when prompted.

## Verify Push

After pushing, check:
- https://github.com/sagarinbabel/beads-lens

You should see all your files there!

