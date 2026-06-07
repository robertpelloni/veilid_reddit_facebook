# CHANGELOG.md

## [1.1.0] - 2026-06-06
### Added
- **Sidecar-naming Protocol**: Standardized Go sidecar binary naming for cross-platform Tauri compatibility.
- **DAO Integration**: Full governance engine ported to native Go core, featuring Quadratic Voting and Liquid Delegation.
- **Decentralized Comments**: Implemented a multi-writer DHT comment system for Home Feed posts.
- **Real-world Reddit Features**: Functional P2P post creation and feed aggregation.
- **Storage Portability**: Added platform-specific data directory resolution for persistent P2P storage.
- **Unified Monorepo**: Consolidated all submodules into the main repository for improved build atomicity.
- **Enhanced P2P Discovery**: Robust DHT-based identity registration and community feedback loops.

### Removed
- Removed the `dao` submodule in favor of native Go core implementation.

## [1.0.0] - 2026-06-05
### Added
- **Official Release**: Finalized the serverless P2P architecture for public release.
- **Unified Identity**: Stabilized the sovereign Routing Pair management and profile publication.
- **Messaging Finalization**: Completed real-time P2P communication layer.
- **Production Documentation**: Added comprehensive Deployment and User Manuals.
- **Hardened Security**: Implemented null-origin sandboxing and restricted API access.

[... previous versions ...]
