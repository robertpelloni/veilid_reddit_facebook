# CHANGELOG.md

## [0.2.0] - 2026-06-05
### Added
- **Core Integration**: Go sidecar (`src-tauri/background`) implementing the Veilid JSON-RPC bridge and SQLite storage layer.
- **Sovereign Identity**: Decentralized profile publication and fetching via Veilid DHT blocks.
- **MySpace Personalization**: Sandboxed rendering engine for user-provided CSS and HTML with strict security controls.
- **Discovery Hub**: Local and P2P registry for finding and subscribing to other user subreddits.
- **Integrated Tooling**: `build-all.sh` for cross-platform sidecar and UI compilation.
- **Validation**: Comprehensive integration test suite for the Go API layer.

### Fixed
- Fixed race condition in feed aggregation where slow DHT responses stalled the UI.
- Improved accessibility in Profile Editor with explicit label bindings.

## [0.1.0] - 2026-06-05
### Added
- Initial project scaffolding (Tauri, React, Vite).
- Basic architectural manifests and project documentation.
