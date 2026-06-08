# CHANGELOG.md

## [1.1.0-prod] - 2026-06-07
### Added
- **Onion-First Networking**: Upgraded all P2P operations (DHT fetch, publish, messaging) to use private 3-hop onion routing contexts by default, hiding node IP addresses from peers.
- **Identity Vault**: Implemented an encrypted storage system for sovereign identities using AES-256-GCM.
- **Sandboxed Privacy Stripping**: Enhanced the profile rendering engine to proactively strip and neutralize tracking pixels and external resource calls in custom CSS and HTML.
- **Midnight Stealth UI**: Introduced a high-contrast, low-light theme with contextual transparency tooltips explaining background P2P operations.
- **Panic Protocol**: Added an instant local session destruction and identity purge mechanism via a "Panic Button."
- **Sidecar-naming Protocol**: Standardized Go sidecar binary naming for cross-platform Tauri compatibility.
- **DAO Integration**: Full governance engine ported to native Go core, featuring Quadratic Voting and Liquid Delegation.
- **Decentralized Comments**: Implemented a multi-writer DHT comment system for Home Feed posts.
- **Real-world Reddit Features**: Functional P2P post creation and feed aggregation.
- **Storage Portability**: Added platform-specific data directory resolution for persistent P2P storage.
- **Unified Monorepo**: Consolidated all submodules into the main repository for improved build atomicity.
- **Enhanced P2P Discovery**: Robust DHT-based identity registration and community feedback loops.
- **Identity Export**: Added functionality to securely export encrypted identity backups as JSON blobs.

### Changed
- Refactored `src/main.tsx` to use modular React hooks (`useDiscovery`, `useDAO`) for better maintainability.
- Updated the Go sidecar to use official Routing Context management for all DHT interactions.

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
