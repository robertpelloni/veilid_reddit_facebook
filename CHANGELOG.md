# CHANGELOG.md

## [0.6.0] - 2026-06-05
### Added
- **UAT Infrastructure**: Created `UAT.md` defining test scenarios and acceptance criteria for final user verification.
- **UAT Deployment Guide**: Added multi-node local and physical network setup instructions to `DEPLOY.md`.

### Fixed
- Resolved TypeScript errors in test files that prevented production builds.
- Refined aggregator logic to handle empty profile metadata gracefully.

## [0.5.0] - 2026-06-05
### Added
- **Automated Testing Suite**: Integrated GitHub Actions workflow (`.github/workflows/test.yml`) for continuous integration of Go and React code.
- **CI Documentation**: Updated `DEPLOY.md` with detailed information on the automated testing pipeline.

## [0.4.0] - 2026-06-05
### Added
- **Real-time Messaging**: Implemented P2P messaging using Veilid `AppMessage` protocol.
- **Messaging API**: Added `/message/send` and `/message/inbox` endpoints.
- **Developer Documentation**: Created `API_DOCUMENTATION.md` for team handoff.
- **Messaging Tests**: Added integration tests for the messaging layer.

## [0.3.0] - 2026-06-05
### Added
- **CI/CD Pipeline**: Integrated GitHub Actions workflow (`.github/workflows/release.yml`) for automated multi-platform builds.
- **User Documentation**: Created a comprehensive `USER_MANUAL.md` for end-user guidance.
- **Production Instructions**: Expanded `DEPLOY.md` with CI/CD and production hardening details.

### Fixed
- Standardized sidecar naming convention for Windows compatibility in CI.

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
