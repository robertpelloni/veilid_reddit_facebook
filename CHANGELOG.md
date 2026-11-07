# CHANGELOG.md

## [1.1.5-prod] - 2026-11-07
### Enhanced
- **Collaborative CRDT Wiki Documentation**: Updated `USER_MANUAL.md` with complete documentation for the decentralized CRDT Subreddit Wiki, detailing LWW registers, Lamport logical clocks, deterministic peer tie-breaking, and LWW moderator sets.
- **Sidecar Build Pipeline Documentation**: Added architecture and deployment guides in `USER_MANUAL.md` and `DEPLOY.md` detailing cross-compilation triples, symbol stripping, and Tauri v2 dual-location staging.
- **Sidecar Build Matrix Hardening**: Updated `scripts/build_sidecar_matrix.sh` with supported matrix validation, empty binary verification, and SHA-256 checksum generation for verifiable builds.

## [1.1.4-prod] - 2026-11-04
### Added
- **Cross-Platform Sidecar Matrix Automation**: Created `scripts/build_sidecar_matrix.sh` automating target triple mapping, compiler flags, and dual-location staging (`src-tauri/bin/` and `src-tauri/`) for Tauri v2.
- **Subreddit Collaborative Editing CRDT**: Implemented state-based Conflict-Free Replicated Data Type (`SubredditCRDTDoc`) in `src/services/crdt.ts` with Last-Write-Wins (LWW) element registers, Lamport logical clocks, and deterministic tie-breaking.
- **Subreddit Wiki UI**: Added `SubredditWikiTab` component in `src/components/SubredditWikiTab.tsx` providing real-time local commit, state export, and peer CRDT state merging.
- **Automated Sidecar Deployment Pipeline**: Integrated matrix target triple build into `.github/workflows/release.yml` with Ubuntu 22.04 runner, WebKitGTK 4.1, and Ayatana AppIndicator libraries.
- **Crypto Signature Disambiguation**: Resolved duplicate identifier conflicts between hex signature verification (`VerifyHexSignature`) and DAO base64 vote verification.

## [1.1.3-prod] - 2026-06-18
### Added
- **Media Player**: Integrated a MySpace-style background audio player into the sovereign profile preview.

## [1.1.2-prod] - 2026-06-18
### Added
- **Top 8 Friends**: Added a "Top 8" friends visualization component to the sovereign profile.
- **Profile Themes**: Added more default MySpace-style templates (Cyberpunk, Retro 90s, Minimalist) to the Profile Editor.

## [1.1.1-prod] - 2026-06-18
### Added
- **Identity Export**: Added UI functionality to export identity backup (Routing Pair) to a downloadable JSON file.
- **Testing**: Added unit tests for `FeedAggregator` service to improve code coverage.

### Changed
- **Refactoring**: Refactored `src/main.tsx` into modular React hooks (`useDiscovery`, `useDAOProposals`) for cleaner state management.

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
