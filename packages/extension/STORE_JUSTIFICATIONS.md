# Chrome Web Store Permission Justifications

Use these justifications when submitting to the Chrome Web Store:

## 1. storage justification*

**Text to use:**
```
The extension uses chrome.storage.local to securely store the user's GitHub Personal Access Token and configured repository list. This allows users to access private repositories and configure which repositories to track. The token is stored locally in the browser and never transmitted except to GitHub's API for fetching Beads data snapshots. No data is collected or transmitted to third parties.
```

## 2. sidePanel justification*

**Text to use:**
```
The extension uses the sidePanel API to display a read-only visualization of Beads project data (Ready items, Blocked items, Dependencies, and Stats) in a dedicated side panel. This provides a non-intrusive way for Product Managers and Engineering Leaders to view project health metrics without disrupting their GitHub browsing experience.
```

## 3. scripting justification*

**Text to use:**
```
The extension uses the scripting permission to inject a content script on GitHub Pull Request pages. This script adds a "Beads Lens" badge that allows users to quickly open the side panel to view Beads data related to the PR. The script only runs on GitHub PR pages (https://github.com/*/*/pull/*) and does not modify page functionality, only adds a visual indicator.
```

## 4. Host permission justification*

**Text to use:**
```
The extension requires access to GitHub domains to fetch Beads data snapshots from repositories. Specifically:
- https://github.com/* - To detect the current repository context and display the side panel
- https://raw.githubusercontent.com/* - To fetch pre-generated Beads data snapshots (.beads/ui/*.json files) from repositories
- https://api.github.com/* - Reserved for future GitHub API integration (currently not actively used, but included for consistency)

The extension only reads data from GitHub repositories that the user has access to. It does not modify any GitHub data, create issues, or perform any write operations. All data fetching is read-only and user-initiated through the side panel interface.
```

## 5. Remote Code - IMPORTANT

**Answer: NO, I am not using remote code**

**Explanation:**
All JavaScript code is bundled in the extension package. The extension only fetches JSON data files from GitHub repositories, which are data files, not executable code. No external JavaScript files are loaded, no eval() is used, and no remote code execution occurs.

**If they still ask for justification (sometimes they do even when you select "No"):**
```
The extension does not use remote code. All JavaScript is included in the extension package. The extension only fetches JSON data files from GitHub repositories (via raw.githubusercontent.com) to display project metrics. These are data files, not executable code. No external scripts are loaded, no eval() is used, and no remote code execution occurs.
```

---

## Additional Notes for Store Submission

### Single Purpose
**Purpose:** "Read-only visualization of Beads project management data in GitHub repositories"

### Privacy Policy
You may need to provide a privacy policy. Suggested text:
```
Beads Lens does not collect, store, or transmit any personal data. All data (GitHub tokens, repository configurations) is stored locally in the browser using Chrome's storage API. The extension only communicates with GitHub's API to fetch project data that the user has access to. No data is sent to third-party servers.
```

### Screenshots Needed
You'll need to provide screenshots showing:
1. The side panel with Ready/Blocked/Deps/Stats tabs
2. The options page for configuration
3. The PR badge on a GitHub PR page

### Description (Short)
```
Read-only PM lens for Beads. Visualize Ready items, Blocked items, Dependencies, and project health metrics directly in GitHub.
```

### Description (Long)
```
Beads Lens is a Chrome extension that provides a read-only Product Management and Engineering Leader lens on top of Beads project management data. 

Features:
- View Ready items with aging information and priority
- See Blocked items and their blockers
- Visualize dependency graphs
- View project health stats (ready count, blocked count, average age, longest chain, cycles)
- Multi-repo support
- Works with both public and private repositories (with GitHub token)

The extension reads pre-generated JSON snapshots from GitHub repositories (.beads/ui/*.json files) and displays them in a convenient side panel. All data is fetched directly from GitHub - no data is collected or transmitted to third parties.

Perfect for Product Managers and Engineering Leaders who want to quickly assess project health and dependencies without leaving GitHub.
```

