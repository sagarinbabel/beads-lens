# Authenticate for GitHub Push

## Option 1: Personal Access Token (Easiest - Recommended)

### Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: `beads-lens-push`
4. Expiration: Choose your preference (90 days, or custom)
5. Select scope: Check `repo` (this gives full control of private repositories)
6. Click "Generate token" at the bottom
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)
   - It will look like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Store Token in Git Credential Helper

Run these commands (I can run them for you if you provide the token):

```bash
# Configure git to store credentials
git config --global credential.helper osxkeychain

# Then push (it will prompt for token once, then remember it)
git push -u origin main
```

When prompted:
- Username: `sagarinbabel`
- Password: **Paste your personal access token** (not your GitHub password)

### Step 3: Push

After setting up, just run:
```bash
cd /Users/sagar/Downloads/projects/beads-lens
git push -u origin main
```

---

## Option 2: Token in URL (Quick but Less Secure)

If you want me to push immediately, you can provide the token and I'll use it in the URL:

```bash
git remote set-url origin https://sagarinbabel:YOUR_TOKEN@github.com/sagarinbabel/beads-lens.git
git push -u origin main
```

**⚠️ Warning**: This stores the token in git config. After pushing, we should remove it:
```bash
git remote set-url origin https://github.com/sagarinbabel/beads-lens.git
```

---

## Option 3: GitHub CLI (Best for Long-term)

1. Install GitHub CLI:
   ```bash
   brew install gh
   ```

2. Authenticate:
   ```bash
   gh auth login
   ```
   - Follow the prompts
   - Choose GitHub.com
   - Choose HTTPS
   - Authenticate via web browser

3. Push:
   ```bash
   git push -u origin main
   ```

---

## Which Option Should You Choose?

- **Option 1** (Token + Credential Helper): Best balance of security and convenience
- **Option 2** (Token in URL): Quickest, but token stored in git config
- **Option 3** (GitHub CLI): Best for long-term, most secure

**Recommendation**: Use Option 1 - it's secure and convenient.

