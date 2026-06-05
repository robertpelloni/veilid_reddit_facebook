# ROADMAP.md

## Phase 1: Sovereign Foundation (COMPLETED)
- [x] Implement Go background sidecar.
- [x] Basic Veilid DHT publication/fetching.
- [x] Secure MySpace-style profile sandboxing.
- [x] Local SQLite discovery hub.

## Phase 2: Decentralized Interaction (IN PROGRESS)
- [ ] **Multi-Writer DHT Trees**: Implement decentralized comment sections for every post.
- [ ] **Cryptographic Voting**: Signed vote aggregation without a central server.
- [ ] **Binary Sidecar Bundling**: Ensure Tauri bundles the Go sidecar automatically in the installer.
- [ ] **Real-time Push**: Use Veilid `AppMessage` for instant comment notifications.

## Phase 3: Network Hardening
- [ ] **Tauri v2 Migration**: Upgrade to Tauri v2 for improved security and performance.
- [ ] **Mobile Port**: Utilize Veilid's Flutter/Dart bindings for a native Android/iOS experience.
- [ ] **Encrypted Media Storage**: Integrate IPFS or Hypercore for large-file media attachments (music, high-res images).
