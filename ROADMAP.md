# ROADMAP.md

## Phase 1: Sovereign Foundation (COMPLETED)
- [x] Implement Go background sidecar.
- [x] Basic Veilid DHT publication/fetching.
- [x] Secure MySpace-style profile sandboxing.
- [x] Local SQLite discovery hub.

## Phase 2: Decentralized Interaction (COMPLETED)
- [x] **Real-time Messaging**: Implemented P2P messaging using Veilid `AppMessage` protocol.
- [x] **Binary Sidecar Bundling**: Standardized Tauri sidecar configuration and lifecycle management.
- [x] **Automated Testing**: Integrated CI pipeline for backend and frontend verification.

## Phase 3: Network Hardening (FUTURE)
- [ ] **Multi-Writer DHT Trees**: Implement decentralized comment sections for every post.
- [ ] **Cryptographic Voting**: Signed vote aggregation without a central server.
- [ ] **Tauri v2 Migration**: Upgrade to Tauri v2 for improved security and performance.
- [ ] **Mobile Port**: Utilize Veilid's Flutter/Dart bindings for a native Android/iOS experience.
- [ ] **Encrypted Media Storage**: Integrate IPFS or Hypercore for large-file media attachments.
