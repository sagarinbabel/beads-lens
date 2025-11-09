# Contributing to Beads Lens

Thank you for your interest in contributing to Beads Lens!

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/beads-lens
   cd beads-lens
   ```

2. Build the exporter:
   ```bash
   cd packages/exporter
   go build -o ../../beads-exporter
   ```

3. Build the native host:
   ```bash
   cd packages/native-host
   go build -o beads-host
   ```

4. Load the extension:
   - Open Chrome → Extensions → Developer mode
   - Click "Load unpacked"
   - Select `packages/extension/` directory

## Project Structure

- `packages/exporter/` - CI exporter that generates JSON snapshots
- `packages/native-host/` - Native Messaging host for local mode
- `packages/extension/` - Chrome extension (MV3)
- `docs/` - Documentation
- `.github/workflows/` - CI/CD workflows

## Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test your changes:
   - Run exporter tests: `cd packages/exporter && go test ./...`
   - Run native host tests: `cd packages/native-host && go test ./...`
   - Test extension manually in Chrome

4. Commit your changes:
   ```bash
   git commit -m "feat: your feature description"
   ```

5. Push and create a pull request

## Code Style

- **Go**: Follow standard Go formatting (`go fmt`)
- **JavaScript**: Use consistent formatting, prefer const/let over var
- **HTML/CSS**: Use semantic HTML, prefer CSS over inline styles

## Testing

- Write tests for new features
- Ensure existing tests pass
- Test on multiple platforms if applicable

## Documentation

- Update README.md if adding new features
- Update docs/ if changing setup or usage
- Add comments for complex logic

## Questions?

Open an issue or start a discussion!


