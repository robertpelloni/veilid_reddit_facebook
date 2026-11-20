# ROADMAP.md

> Status corrected 2026-11-19: items are only checked when they are
> verified in this repo as local code. Anything that depends on a real
> Veilid network is UNVERIFIED until a publish/fetch between two real
> nodes on two machines is demonstrated.

## Phase 1: Sovereign Foundation (LOCAL PARTS DONE, NETWORK UNVERIFIED)
- [x] Implement Go background sidecar.
- [ ] Basic Veilid DHT publication/fetching — UNVERIFIED. The Go client is an unverified JSON-RPC stub to an external daemon; no real DHT publish/fetch has been demonstrated.
- [x] Secure MySpace-style profile sandboxing — local UI sandboxing only.
- [x] Local SQLite discovery hub — local only, not network discovery.

## Phase 2: Decentralized Interaction (LOCAL SCAFFOLDING ONLY)
- [ ] **Real-time Messaging** — UNVERIFIED. A sidecar endpoint calls a stub `AppMessage` RPC; no P2P message between two machines has been demonstrated.
- [x] **DAO Integration**: Governance engine code exists in the native Go core (QV, Delegation) — local code, not a live networked DAO.
- [ ] **Multi-Writer DHT Comments** — UNVERIFIED. Comments are implemented locally (sidecar SQLite / browser simulation); decentralized multi-writer DHT comments have not been demonstrated.
- [x] **Automated Testing**: CI pipeline for backend and frontend verification is in the repo.

## Phase 3: Network Hardening (ACTIVE)
- [ ] **Secure Identity Vault** — UNVERIFIED / LOCAL ONLY. Key generation exists locally; the browser identity is simulated (see `browser_veilid.ts`) and is not a Veilid identity, and no vault has been audited.
- [x] **Stealth Launch Strategy**: Detailed rollout and user acquisition plan — a document, not a launch.
- [ ] **Cryptographic Voting** — UNVERIFIED. Signed vote code exists locally; "full DHT integration" has not been demonstrated.
- [x] **Tauri v2 Migration**: Tauri v2 shell is in the repo (`src-tauri/`, strict v2 capabilities schema).
- [ ] **Mobile Port**: Utilize Veilid's Flutter/Dart bindings for a native Android/iOS experience.
- [ ] **Encrypted Media Storage**: Integrate IPFS or Hypercore for large-file media attachments. (Current sidecar media is a local mock-media reference, not IPFS.)
