# Beads Lens - Alpha Release (CI Mode)

## Overview

Beads Lens is a Chrome Extension that provides a read-only PM/Engineering Leader lens on top of [Beads](https://github.com/steveyegge/beads). It visualizes Ready/Blocked items, dependencies, and project health metrics directly in GitHub.

**Alpha Focus:** CI mode only - extension reads pre-generated snapshots from GitHub repos.

**UI Preview:** Open `mockup.html` in your browser to see what the extension looks like.

## What It Is

- Chrome MV3 extension
- Read-only visualization layer
- For Product Managers and Engineering Leaders
- Open source, hosted on GitHub

## Architecture

```
GitHub Actions → bd CLI → .beads/ui/*.json → Chrome Extension → User
```

1. **GitHub Actions workflow** runs the exporter on push to main
2. **Exporter** (Go CLI) calls `bd` commands, writes JSON snapshots to `.beads/ui/`
3. **Chrome Extension** fetches snapshots from `raw.githubusercontent.com`
4. **Side panel** renders Ready, Blocked, Deps, Stats views

## Core Features (Alpha)

### Side Panel Views
- **Ready tab:** List of ready items with aging badges and priority
- **Blocked tab:** Blocked items with blocker counts
- **Deps tab:** Dependency graph (Cytoscape rendering)
- **Stats tab:** Metrics (ready count, blocked count, avg age, longest chain, cycles)

### Status Strip (Always Visible)
Shows data provenance: `Source: CI • SHA: abc123 • bd v0.9.0 • generated_at: timestamp`

### PR Overlay
Badge on GitHub PR pages showing linked Beads IDs and "unblocks N items" summary

### Multi-Repo Rollup
Aggregates stats across multiple configured repositories

### Error States
- "No snapshots found"
- "Stale data" (> X days old)
- "Schema mismatch"

## Repository Structure

```
beads-lens/
├── LICENSE                    # MIT
├── README.md
├── CONTRIBUTING.md
├── SECURITY.md
├── mockup.html               # UI visualization
├── packages/
│   ├── extension/            # Chrome MV3 extension
│   │   ├── manifest.json
│   │   ├── background.js
│   │   ├── sidepanel.html
│   │   ├── sidepanel.js
│   │   ├── sidepanel.css
│   │   ├── options.html      # Token + repo config
│   │   ├── options.js
│   │   ├── content.js        # PR overlays
│   │   ├── lib/
│   │   │   ├── api.js        # GitHub fetcher
│   │   │   ├── storage.js
│   │   │   └── schemas.js
│   │   └── icons/            # 16/48/128.png
│   └── exporter/             # CI exporter (Go)
│       ├── go.mod
│       ├── main.go
│       └── schema.go
├── .github/
│   └── workflows/
│       └── beads-export.yml  # CI workflow
├── fixtures/                 # Mock data for testing
│   └── .beads/ui/*.json
└── docs/
    ├── SETUP.md
    ├── USAGE.md
    ├── PRIVACY.md
    ├── STORE_SUBMISSION.md
    └── SCHEMAS.md
```

## Data Contracts

All JSON files share a common envelope:

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123deadbeef",
  "generated_at": "2025-11-09T19:35:00Z",
  "source": "ci"
}
```

### issues.json

Full issue list with dependencies.

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123",
  "generated_at": "2025-11-09T19:35:00Z",
  "source": "ci",
  "issues": [
    {
      "id": "bd_7f8a...",
      "title": "Refactor parser",
      "status": "ready|blocked|wip|done",
      "priority": "P0|P1|P2|P3",
      "labels": ["agent", "risk"],
      "assignee": "agent|human|unknown",
      "created_at": "2025-11-06T10:03:00Z",
      "updated_at": "2025-11-08T17:00:00Z",
      "depends_on": ["bd_a1", "bd_b2"],
      "blocks": ["bd_c3"],
      "notes": "optional short text",
      "url": "https://github.com/org/repo/..."
    }
  ]
}
```

### ready.json

Ready items with aging information.

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123",
  "generated_at": "2025-11-09T19:35:00Z",
  "source": "ci",
  "ready": [
    {
      "id": "bd_7f8a...",
      "title": "Refactor parser",
      "age_days": 1.7,
      "priority": "P1"
    }
  ]
}
```

### blocked.json

Blocked items with blocker references.

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123",
  "generated_at": "2025-11-09T19:35:00Z",
  "source": "ci",
  "blocked": [
    {
      "id": "bd_c3",
      "title": "Ship API",
      "blocked_by": ["bd_7f8a"],
      "priority": "P0"
    }
  ]
}
```

### deps.json

Dependency graph nodes and edges.

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123",
  "generated_at": "2025-11-09T19:35:00Z",
  "source": "ci",
  "nodes": [
    {"id": "bd_7f8a", "label": "Refactor parser"}
  ],
  "edges": [
    {"from": "bd_7f8a", "to": "bd_c3"}
  ]
}
```

### stats.json

Aggregate metrics.

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123",
  "generated_at": "2025-11-09T19:35:00Z",
  "source": "ci",
  "ready": 12,
  "blocked": 5,
  "avg_ready_age_days": 2.3,
  "longest_chain": 6,
  "cycles": 1
}
```

### graph.mmd (optional)

Mermaid diagram for dependency visualization.

```
graph TD
  bd_7f8a["Refactor parser"] --> bd_c3["Ship API"]
```

## CI Exporter (Go)

### Purpose
Runs pinned `bd` CLI commands, wraps output in versioned envelopes, writes to `.beads/ui/`.

### Implementation

**packages/exporter/main.go**

```go
package main

import (
  "encoding/json"
  "fmt"
  "os"
  "os/exec"
  "time"
)

type Envelope struct {
  SchemaVersion string `json:"schema_version"`
  BdVersion     string `json:"bd_version"`
  GitSHA        string `json:"git_sha"`
  GeneratedAt   string `json:"generated_at"`
  Source        string `json:"source"`
}

func runBdJSON(args ...string) (map[string]any, error) {
  cmd := exec.Command("bd", args...)
  out, err := cmd.Output()
  if err != nil {
    return nil, err
  }
  var v map[string]any
  if err := json.Unmarshal(out, &v); err != nil {
    return nil, err
  }
  return v, nil
}

func writeJSON(path string, body any, env Envelope) error {
  m := map[string]any{
    "schema_version": env.SchemaVersion,
    "bd_version":     env.BdVersion,
    "git_sha":        env.GitSHA,
    "generated_at":   env.GeneratedAt,
    "source":         env.Source,
  }
  switch b := body.(type) {
  case map[string]any:
    for k, v := range b {
      m[k] = v
    }
  }
  f, err := os.Create(path)
  if err != nil {
    return err
  }
  defer f.Close()
  enc := json.NewEncoder(f)
  enc.SetIndent("", "  ")
  return enc.Encode(m)
}

func main() {
  _ = os.MkdirAll(".beads/ui", 0o755)

  // Get bd version - adjust based on actual Beads CLI
  // See: https://github.com/steveyegge/beads for actual commands
  bdvRaw, _ := runBdJSON("version", "--json")
  bdv := "unknown"
  if s, ok := bdvRaw["version"].(string); ok {
    bdv = s
  }

  // Get git SHA
  git := exec.Command("git", "rev-parse", "HEAD")
  shaBytes, _ := git.Output()
  sha := string(shaBytes)

  env := Envelope{
    SchemaVersion: "1",
    BdVersion:     bdv,
    GitSHA:        sha,
    GeneratedAt:   time.Now().UTC().Format(time.RFC3339),
    Source:        "ci",
  }

  // Run bd commands - adjust flags based on actual Beads CLI
  ready, _ := runBdJSON("ready", "--json")
  blocked, _ := runBdJSON("blocked", "--json")
  issues, _ := runBdJSON("list", "--json")
  stats, _ := runBdJSON("stats", "--json")
  deps, _ := runBdJSON("dep", "graph", "--json")

  // Write snapshots
  _ = writeJSON(".beads/ui/ready.json", ready, env)
  _ = writeJSON(".beads/ui/blocked.json", blocked, env)
  _ = writeJSON(".beads/ui/issues.json", issues, env)
  _ = writeJSON(".beads/ui/stats.json", stats, env)
  _ = writeJSON(".beads/ui/deps.json", deps, env)

  fmt.Println("Exporter wrote .beads/ui/*")
}
```

**Note:** Refer to [Beads documentation](https://github.com/steveyegge/beads) for actual CLI commands and flags.

## GitHub Actions Workflow

**.github/workflows/beads-export.yml**

```yaml
name: Beads Export
on:
  push:
    branches: [main]
  workflow_dispatch: {}

jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install pinned bd
        run: |
          # TODO: Replace with actual Beads release URL
          # See: https://github.com/steveyegge/beads/releases
          curl -L -o bd.tgz https://github.com/steveyegge/beads/releases/download/v0.9.0/linux-amd64.tgz
          tar xzf bd.tgz
          sudo mv bd /usr/local/bin/bd
          bd --version || true

      - name: Build exporter
        run: |
          cd packages/exporter
          go build -o ../../beads-exporter
          cd ../../

      - name: Run exporter
        run: ./beads-exporter

      - name: Commit snapshots
        run: |
          git config user.name "beads-bot"
          git config user.email "beads-bot@users.noreply.github.com"
          git add .beads/ui
          if ! git diff --cached --quiet; then
            git commit -m "chore(beads): update UI snapshots"
            git push
          fi
```

## Chrome Extension

### manifest.json

```json
{
  "manifest_version": 3,
  "name": "Beads Lens",
  "version": "0.1.0",
  "description": "Read-only PM lens for Beads. See Ready, Blocked, Deps, Stats.",
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "permissions": ["storage", "sidePanel", "scripting"],
  "host_permissions": [
    "https://github.com/*",
    "https://raw.githubusercontent.com/*",
    "https://api.github.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "options_page": "options.html",
  "content_scripts": [{
    "matches": ["https://github.com/*/*/pull/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }]
}
```

### options.html

Settings page for GitHub token and repo configuration.

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Beads Lens Settings</title>
  <link rel="stylesheet" href="options.css">
</head>
<body>
  <h2>Beads Lens Settings</h2>

  <div class="section">
    <label for="token">GitHub Personal Access Token (for private repos):</label>
    <input id="token" type="password" placeholder="ghp_..." />
    <p class="hint">Leave empty for public repos. Requires 'repo' read scope.</p>
  </div>

  <div class="section">
    <label for="repos">Tracked Repositories (one per line):</label>
    <textarea id="repos" rows="6" placeholder="owner/repo&#10;org/another-repo"></textarea>
  </div>

  <button id="save">Save</button>
  <div id="status"></div>

  <script src="options.js"></script>
</body>
</html>
```

### options.js

```js
const el = (id) => document.getElementById(id);

(async () => {
  const st = await chrome.storage.local.get(["token", "repos"]);
  el("token").value = st.token || "";
  el("repos").value = (st.repos || []).join("\n");
})();

el("save").onclick = async () => {
  const token = el("token").value.trim();
  const repos = el("repos").value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);

  await chrome.storage.local.set({ token, repos });

  const status = el("status");
  status.textContent = "Saved!";
  status.style.color = "green";
  setTimeout(() => { status.textContent = ""; }, 2000);
};
```

### lib/storage.js

```js
export async function getSettings() {
  const { token = "", repos = [] } = await chrome.storage.local.get([
    "token",
    "repos"
  ]);
  return { token, repos };
}
```

### lib/api.js

Fetches snapshots from GitHub.

```js
import { getSettings } from "./storage.js";

async function githubGet(url, token) {
  const headers = {};
  if (token) {
    headers["Authorization"] = `token ${token}`;
  }

  const resp = await fetch(url, { headers });
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  }
  return resp.json();
}

export async function fetchSnapshots(owner, repo, ref = "HEAD") {
  const { token } = await getSettings();
  const base = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/.beads/ui`;

  const [issues, ready, blocked, stats, deps] = await Promise.all([
    githubGet(`${base}/issues.json`, token),
    githubGet(`${base}/ready.json`, token),
    githubGet(`${base}/blocked.json`, token),
    githubGet(`${base}/stats.json`, token),
    githubGet(`${base}/deps.json`, token)
  ]);

  return { issues, ready, blocked, stats, deps };
}
```

### sidepanel.html

```html
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Beads Lens</title>
  <link rel="stylesheet" href="sidepanel.css">
</head>
<body>
  <div id="header">
    <div id="status-strip">
      <span id="source"></span> •
      <span id="sha"></span> •
      <span id="bdv"></span> •
      <span id="time"></span>
    </div>
    <button id="refresh">Refresh</button>
  </div>

  <nav id="tabs">
    <button data-tab="ready" class="active">Ready</button>
    <button data-tab="blocked">Blocked</button>
    <button data-tab="deps">Deps</button>
    <button data-tab="stats">Stats</button>
  </nav>

  <div id="view"></div>

  <script type="module" src="sidepanel.js"></script>
</body>
</html>
```

### sidepanel.js

Main side panel logic.

```js
import { getSettings } from "./lib/storage.js";
import { fetchSnapshots } from "./lib/api.js";

const view = document.getElementById("view");
const hdr = {
  source: document.getElementById("source"),
  sha: document.getElementById("sha"),
  bdv: document.getElementById("bdv"),
  time: document.getElementById("time")
};

let currentData = null;
let currentTab = "ready";

async function load() {
  try {
    const ctx = await detectContext();
    const data = await fetchSnapshots(ctx.owner, ctx.repo, ctx.ref);
    currentData = data;

    const meta = data.issues || data.ready || data.stats;
    hdr.source.textContent = `Source: ${meta?.source || "ci"}`;
    hdr.sha.textContent = `SHA: ${(meta?.git_sha || "unknown").substring(0, 7)}`;
    hdr.bdv.textContent = `bd v${meta?.bd_version || "?"}`;
    hdr.time.textContent = new Date(meta?.generated_at || Date.now()).toLocaleString();

    render(currentTab);
  } catch (err) {
    view.innerHTML = `<div class="error">Error: ${err.message}</div>`;
  }
}

function detectContext() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      const url = new URL(tabs[0].url);
      const [, owner, repo] = url.pathname.split("/");
      resolve({ owner, repo, ref: "HEAD" });
    });
  });
}

function render(tab) {
  if (!currentData) return;
  currentTab = tab;

  if (tab === "ready") {
    const rows = (currentData.ready.ready || [])
      .map(r => `
        <div class="row">
          <span class="title">${r.title}</span>
          <span class="priority">${r.priority || ""}</span>
          <span class="age ${r.age_days > 3 ? "aged" : ""}">${r.age_days || 0}d</span>
        </div>
      `)
      .join("");
    view.innerHTML = `<h3>Ready</h3><div class="list">${rows || "No ready items"}</div>`;
  } else if (tab === "blocked") {
    const rows = (currentData.blocked.blocked || [])
      .map(b => `
        <div class="row">
          <span class="title">${b.title}</span>
          <span class="blocker-count">Blocked by ${b.blocked_by?.length || 0}</span>
        </div>
      `)
      .join("");
    view.innerHTML = `<h3>Blocked</h3><div class="list">${rows || "No blocked items"}</div>`;
  } else if (tab === "stats") {
    const s = currentData.stats;
    view.innerHTML = `
      <h3>Stats</h3>
      <ul class="stats-list">
        <li>Ready: <strong>${s.ready}</strong></li>
        <li>Blocked: <strong>${s.blocked}</strong></li>
        <li>Avg Ready Age: <strong>${s.avg_ready_age_days}d</strong></li>
        <li>Longest Chain: <strong>${s.longest_chain}</strong></li>
        <li>Cycles: <strong>${s.cycles}</strong></li>
      </ul>
    `;
  } else if (tab === "deps") {
    // Simple edge list for v1 - Cytoscape integration can be added later
    const edges = (currentData.deps.edges || [])
      .map(e => `<li>${e.from} → ${e.to}</li>`)
      .join("");
    view.innerHTML = `<h3>Dependencies</h3><ul class="deps-list">${edges || "No edges"}</ul>`;
  }
}

document.getElementById("refresh").onclick = load;
document.querySelectorAll("#tabs button").forEach(b => {
  b.onclick = () => {
    document.querySelectorAll("#tabs button").forEach(btn => btn.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.tab);
  };
});

load();
```

### content.js

PR overlay badge.

```js
(async function() {
  const path = location.pathname.split("/");
  if (path.length < 5) return;

  const owner = path[1];
  const repo = path[2];

  const title = document.querySelector("span.js-issue-title");
  if (!title) return;

  const badge = document.createElement("span");
  badge.textContent = "Beads Lens";
  badge.style.marginLeft = "8px";
  badge.style.padding = "2px 6px";
  badge.style.border = "1px solid #ddd";
  badge.style.borderRadius = "8px";
  badge.style.fontSize = "12px";
  badge.style.cursor = "pointer";
  badge.title = "Open Beads Lens side panel";

  badge.onclick = () => {
    chrome.runtime.sendMessage({ action: "openSidePanel" });
  };

  title.appendChild(badge);
})();
```

### background.js

Minimal service worker for MV3.

```js
chrome.runtime.onInstalled.addListener(() => {
  console.log("Beads Lens installed");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "openSidePanel") {
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
  }
});
```

## Security

- **No data leaves the browser** - all processing client-side
- **GitHub token stored locally** in `chrome.storage.local`, never transmitted
- **Minimal permissions** - only `storage`, `sidePanel`, `scripting`
- **Host permissions scoped** to GitHub domains only
- **No remote code execution** - all code bundled in extension
- **Read-only** - no mutations to Beads data

## Testing

### Golden Files

Create fixture data for testing without a real Beads repo.

**Create these files in `fixtures/.beads/ui/`:**

#### fixtures/.beads/ui/issues.json

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123def",
  "generated_at": "2025-11-09T12:00:00Z",
  "source": "ci",
  "issues": [
    {
      "id": "bd_001",
      "title": "Implement auth system",
      "status": "ready",
      "priority": "P0",
      "labels": ["backend"],
      "assignee": "human",
      "created_at": "2025-11-01T10:00:00Z",
      "updated_at": "2025-11-08T15:30:00Z",
      "depends_on": [],
      "blocks": ["bd_002"],
      "url": "https://github.com/example/repo/issues/1"
    },
    {
      "id": "bd_002",
      "title": "Build user dashboard",
      "status": "blocked",
      "priority": "P1",
      "labels": ["frontend"],
      "assignee": "agent",
      "created_at": "2025-11-02T09:00:00Z",
      "updated_at": "2025-11-08T16:00:00Z",
      "depends_on": ["bd_001"],
      "blocks": [],
      "url": "https://github.com/example/repo/issues/2"
    }
  ]
}
```

#### fixtures/.beads/ui/ready.json

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123def",
  "generated_at": "2025-11-09T12:00:00Z",
  "source": "ci",
  "ready": [
    {
      "id": "bd_001",
      "title": "Implement auth system",
      "age_days": 1.2,
      "priority": "P0"
    },
    {
      "id": "bd_003",
      "title": "Add error handling",
      "age_days": 2.5,
      "priority": "P1"
    },
    {
      "id": "bd_004",
      "title": "Refactor database queries",
      "age_days": 4.1,
      "priority": "P2"
    }
  ]
}
```

#### fixtures/.beads/ui/blocked.json

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123def",
  "generated_at": "2025-11-09T12:00:00Z",
  "source": "ci",
  "blocked": [
    {
      "id": "bd_002",
      "title": "Build user dashboard",
      "blocked_by": ["bd_001"],
      "priority": "P1"
    },
    {
      "id": "bd_005",
      "title": "Launch mobile app",
      "blocked_by": ["bd_002", "bd_003"],
      "priority": "P0"
    }
  ]
}
```

#### fixtures/.beads/ui/deps.json

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123def",
  "generated_at": "2025-11-09T12:00:00Z",
  "source": "ci",
  "nodes": [
    {"id": "bd_001", "label": "Implement auth system"},
    {"id": "bd_002", "label": "Build user dashboard"},
    {"id": "bd_003", "label": "Add error handling"},
    {"id": "bd_004", "label": "Refactor database queries"}
  ],
  "edges": [
    {"from": "bd_001", "to": "bd_002"},
    {"from": "bd_003", "to": "bd_002"},
    {"from": "bd_002", "to": "bd_004"}
  ]
}
```

#### fixtures/.beads/ui/stats.json

```json
{
  "schema_version": "1",
  "bd_version": "0.9.0",
  "git_sha": "abc123def",
  "generated_at": "2025-11-09T12:00:00Z",
  "source": "ci",
  "ready": 12,
  "blocked": 5,
  "avg_ready_age_days": 2.3,
  "longest_chain": 6,
  "cycles": 1
}
```

### Testing Strategy

1. **Unit tests** - Test data parsing and schema validation
2. **Golden file tests** - Exporter output matches expected structure
3. **Extension e2e** - Playwright tests with fixture data
4. **Manual testing** - Demo repo with committed `.beads/ui/*` files

### Demo Repository

Create a public demo repo with:
- `.beads/ui/*.json` fixtures committed
- README explaining this is for Beads Lens demo
- Link from extension README to this demo

## UX Guardrails

- **Always show source and freshness** - Never imply global truth
- **Badge aged items** - Highlight items > 3 days in Ready
- **Surface cycles and long chains** - Warning indicators
- **No assignee/sprint fields** - This is not an issue tracker
- **Error states** - Clear messages for missing/stale/invalid data

## Build Notes

- Pin `bd` version via installer or Docker in CI
- Export only fields you render
- Treat exporter output as versioned API
- Annotate every file with `bd_version`, `schema_version`, `git_sha`, `generated_at`
- Validate JSON schemas before render
- Cytoscape for dependency graph (or simple list for MVP)
- MV3 lifecycle: Background service workers sleep - keep connections in side panel
- Performance: Virtualize large lists if needed
- Cross-platform: Handle Windows/Mac/Linux paths in exporter

## Release Process

1. Tag version `v0.1.0`
2. Build exporter binary for Linux (for GitHub Actions)
3. Package extension directory as ZIP
4. Upload to Chrome Web Store
5. Create demo repository with sample `.beads/ui/*` data
6. Announce with install link

## Documentation Requirements

### README.md
- What is Beads Lens
- Screenshots (from mockup.html)
- Quick start (public repos)
- Quick start (private repos with token)
- Privacy and security
- Roadmap (link to roadmap.md)
- Contributing
- License (MIT)

### docs/SETUP.md
- Add workflow to repo
- Pin bd version
- Merge to main
- Install extension from Chrome Web Store
- Configure options (if private repo)

### docs/USAGE.md
- Side panel tabs explained
- PR overlay badge
- Multi-repo rollup
- Troubleshooting

### docs/PRIVACY.md
- No data collection
- Token stored locally
- No telemetry (optional opt-in for future)

### docs/STORE_SUBMISSION.md
- Icons (128/48/16)
- Screenshots (3 required)
- Short description
- Long description
- Privacy disclosure
- Link to PRIVACY.md and SECURITY.md
- Zip packaging instructions

## What Not to Do

- No create/update/close operations
- No dependency mutations
- No parsing Beads internal SQLite/JSONL directly
- No localhost HTTP server
- No remote code execution
- No wildcards in permissions

## Known Limitations (Alpha)

- **Snapshot-based** - Data is as fresh as last CI run
- **No real-time updates** - User must refresh or wait for CI
- **Public repos easier** - Private repos require PAT setup
- **Depends on Beads alpha** - APIs may change

## Success Criteria

- [ ] One-click install from Chrome Web Store
- [ ] Works with public repos without configuration
- [ ] Clear setup instructions for private repos
- [ ] Demo repository showcases all features
- [ ] No security vulnerabilities
- [ ] Passes Chrome Web Store review
