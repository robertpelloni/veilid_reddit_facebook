# CHANGELOG.md

## [1.1.0-testnet] - 2026-06-05
### Added
- **Testnet Support**: Created `TESTNET.md` with guidelines for public P2P verification.
- **Improved Observability**: Added detailed error logging in the P2P messaging client to diagnose testnet failures.

## [1.1.0-staging] - 2026-06-05
### Added
- **Staging Infrastructure**: Created `STAGING.md` with multi-node configuration guidelines and port offset strategies.
- **Environment Isolation**: Prepared storage and network configurations for the staging subset of the Veilid DHT.

## [1.0.0] - 2026-06-05
### Added
- **Production Baseline**: Finalized the serverless P2P architecture for public release.
- **CI/CD Maturity**: Integrated automated testing and multi-platform release workflows.
- **Unified Identity**: Stabilized the sovereign Routing Pair management and profile publication.
- **Messaging Finalization**: Completed real-time P2P communication layer.
- **Production Documentation**: Added comprehensive Deployment and User Manuals.

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
