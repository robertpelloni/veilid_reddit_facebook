# CHANGELOG.md

## [1.1.0] - 2026-06-05
### Added
- **DAO Integration**: Full governance engine ported to native Go core, featuring Quadratic Voting and Liquid Delegation.
- **Unified Monorepo**: Consolidated all submodules into the main repository for improved build atomicity and simplified CI/CD.
- **Enhanced P2P Discovery**: Robust DHT-based identity registration for DAO participants.

### Removed
- Removed the `dao` submodule in favor of native Go core implementation.

## [1.0.0] - 2026-06-05
### Added
- **Official Release**: Finalized the serverless P2P architecture for public release.
- **Unified Identity**: Stabilized the sovereign Routing Pair management and profile publication.
- **Messaging Finalization**: Completed real-time P2P communication layer.
- **Production Documentation**: Added comprehensive Deployment and User Manuals.

## [0.5.0] - 2026-06-05
### Added
- **Automated Testing Suite**: Integrated GitHub Actions workflow (`.github/workflows/test.yml`) for continuous integration.

## [0.4.0] - 2026-06-05
### Added
- **Real-time Messaging**: Implemented P2P messaging using Veilid `AppMessage` protocol.
- **Developer Documentation**: Created `API_DOCUMENTATION.md` for team handoff.

## [0.3.0] - 2026-06-05
### Added
- **CI/CD Pipeline**: Integrated GitHub Actions workflow for automated builds.
- **User Documentation**: Created a comprehensive `USER_MANUAL.md`.

## [0.2.0] - 2026-06-05
### Added
- **Core Integration**: Go sidecar implementing the Veilid JSON-RPC bridge and SQLite layer.
- **Sovereign Identity**: Decentralized profile publication via Veilid DHT.

## [0.1.0] - 2026-06-05
### Added
- Initial project scaffolding (Tauri, React, Vite).
