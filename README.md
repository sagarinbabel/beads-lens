# Beads Lens

A Chrome Extension that provides a read-only Product Management and Engineering Leader lens on top of [Beads](https://github.com/steveyegge/beads) project management data. Visualize Ready items, Blocked items, Dependencies, and project health metrics directly in GitHub.

## Features

- 📊 **Ready Items View** - See ready-to-work items with aging information and priority
- 🚫 **Blocked Items View** - View blocked items and their blockers
- 🔗 **Dependencies Graph** - Visualize project dependencies
- 📈 **Stats Dashboard** - View project health metrics (ready count, blocked count, average age, longest chain, cycles)
- 🔐 **Private Repo Support** - Works with both public and private repositories (with GitHub token)
- 🎯 **Multi-Repo Support** - Track multiple repositories
- 🏷️ **PR Integration** - Badge on GitHub PR pages for quick access

## Quick Start

### 1. Install the Extension

**From Chrome Web Store** (coming soon):
1. Install from [Chrome Web Store](https://chrome.google.com/webstore) (link will be added after publication)

**From Source**:
1. Clone this repository:
   ```bash
   git clone https://github.com/sagarinbabel/beads-lens.git
   cd beads-lens
   ```

2. Build the extension:
   ```bash
   cd packages/extension
   npm install
   npm run build
   ```

3. Load in Chrome:
   - Open Chrome → Extensions (`chrome://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `packages/extension` folder

### 2. Set Up Your Repository

Your GitHub repository needs Beads data snapshots. See [Setting up the Exporter](#setting-up-the-exporter) below.

### 3. Configure the Extension

1. Right-click the extension icon → **Options**
2. Add your GitHub Personal Access Token (for private repos)
3. Add repositories to track (format: `owner/repo`)
4. Navigate to a GitHub repository and click the extension icon to view Beads data

## Setting up the Exporter

The extension reads pre-generated JSON snapshots from GitHub repositories. You need to set up a CI workflow to generate these snapshots.

### 1. Add GitHub Actions Workflow

Create `.github/workflows/beads-export.yml` in your repository:

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
          # Install Beads CLI (adjust URL based on actual release)
          curl -L -o bd.tgz https://github.com/steveyegge/beads/releases/download/v0.9.0/linux-amd64.tgz
          tar xzf bd.tgz
          sudo mv bd /usr/local/bin/bd
          bd --version

      - name: Build exporter
        run: |
          cd packages/exporter
          go build -o ../../beads-exporter

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

### 2. Build the Exporter

The exporter is a Go CLI that generates JSON snapshots:

```bash
cd packages/exporter
go build -o ../../beads-exporter
```

### 3. Data Format

The exporter generates JSON files in `.beads/ui/`:
- `issues.json` - Full issue list
- `ready.json` - Ready items
- `blocked.json` - Blocked items
- `deps.json` - Dependency graph
- `stats.json` - Aggregate metrics

See `packages/exporter/schema.go` for the data structure.

## Project Structure

```
beads-lens/
├── packages/
│   ├── extension/          # Chrome MV3 extension
│   │   ├── manifest.json   # Extension manifest
│   │   ├── *.ts            # TypeScript source files
│   │   ├── *.js            # Compiled JavaScript
│   │   └── lib/            # Shared utilities
│   ├── exporter/           # CI exporter (Go)
│   │   ├── main.go         # Exporter CLI
│   │   └── schema.go       # Data schema definitions
│   └── native-host/        # Native Messaging host (future)
├── docs/                   # Documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── SECURITY.md             # Security policy
└── LICENSE                 # MIT License
```

## Development

### Extension Development

```bash
cd packages/extension
npm install
npm run build      # Build once
npm run watch      # Watch mode for development
```

### Exporter Development

```bash
cd packages/exporter
go build -o ../../beads-exporter
./beads-exporter   # Run locally
```

## Architecture

```
GitHub Actions → bd CLI → .beads/ui/*.json → Chrome Extension → User
```

1. **GitHub Actions workflow** runs the exporter on push to main
2. **Exporter** (Go CLI) calls `bd` commands, writes JSON snapshots to `.beads/ui/`
3. **Chrome Extension** fetches snapshots from `raw.githubusercontent.com`
4. **Side panel** renders Ready, Blocked, Deps, Stats views

## Requirements

- **Chrome Browser** - For running the extension
- **Node.js** - For building the extension (TypeScript)
- **Go** - For building the exporter (optional, if modifying exporter)
- **Beads CLI** - For generating project data (in CI)

## Privacy & Security

- **No data collection** - All data processing happens client-side
- **Local storage** - GitHub tokens stored locally in browser (encrypted by Chrome)
- **No external requests** - Extension only communicates with GitHub API
- **Minimal permissions** - Only requests necessary permissions
- **Read-only** - Extension never modifies GitHub data

See [SECURITY.md](SECURITY.md) for more details.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- **Repository**: https://github.com/sagarinbabel/beads-lens
- **Issues**: https://github.com/sagarinbabel/beads-lens/issues
- **Beads Project**: https://github.com/steveyegge/beads

## Status

🚧 **Alpha Release** - CI mode only. See [prd-alpha.md](prd-alpha.md) for the full specification.

---

Made with ❤️ for Product Managers and Engineering Leaders

