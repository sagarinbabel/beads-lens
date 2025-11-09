# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

Please report (suspected) security vulnerabilities to **[security@example.com]** (replace with your email). You will receive a response within 48 hours. If the issue is confirmed, we will release a patch as soon as possible depending on complexity but historically within a few days.

## Security Considerations

### Extension Security

- **Minimal Permissions**: The extension requests only necessary permissions (storage, sidePanel, scripting, GitHub host access)
- **No Data Collection**: No telemetry or analytics by default
- **Local Storage**: GitHub tokens stored in chrome.storage.local (encrypted by Chrome)
- **No External Requests**: Extension only communicates with GitHub API or local native host

### Native Host Security

- **Workspace Allowlist**: Native host validates workspace paths against a configured allowlist
- **Command Allowlist**: Only read-only bd commands are allowed
- **Path Sanitization**: Symlinks and paths outside allowlist are rejected
- **Timeouts**: All commands have timeout limits
- **No Logging**: Repository contents are not logged

### CI Exporter Security

- **Pinned bd Version**: CI workflow uses a pinned version of bd
- **Read-Only**: Exporter only reads bd data, never modifies
- **Validation**: JSON output is validated against schema

## Best Practices

1. Keep bd version pinned and up-to-date
2. Regularly review workspace allowlists
3. Use GitHub PATs with minimal required permissions
4. Keep extension updated to latest version
5. Review permissions requested by extension

## Disclosure Policy

When we receive a security bug report, we will assign it to a primary handler. This person will coordinate the fix and release process:

1. Confirm the problem and determine affected versions
2. Audit code to find any potential similar problems
3. Prepare fixes for all releases still under maintenance
4. Release patches simultaneously


