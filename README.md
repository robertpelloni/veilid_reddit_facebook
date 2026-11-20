# Veilid Reddit MySpace (veilid_reddit_facebook)

A prototype desktop social app in the shape of "Reddit meets MySpace" — threaded posts plus heavily personalized profile pages — designed to run over the Veilid P2P network instead of a central server. (The repo name says "facebook"; the app itself is the Reddit/MySpace concept in `VISION.md`.)

## Status

**Active staging prototype, agent-driven development. Current version: `1.1.6-prod` (`VERSION.md`, synced in `package.json`).** Last significant activity: **2026-11-15** — reconcile of the jules-scaffold branch into main (Protocol #300, v1.1.6-prod superset), after the 2026-11-12 merge of the Tauri v2 sidecar pipeline branch (Protocol #281). Nov 9–11 work added a browser-only fallback client, network mode indicators, sidecar build automation, and CRDT collaborative wiki documentation.

Not a launched decentralized social network. There are no GitHub releases attached to the repo, and no license file despite the old README's "open-source" framing — treat the version label as an agent-era staging name, not a shipped release.

**What is NOT proven — read this before believing the rest:**
- No real peer-to-peer post, profile, or message has been demonstrated between two machines over Veilid. The P2P feature set is design + integration scaffolding, not a verified network.
- The browser client (`BrowserVeilidClient`) is a **simulation**: it stores data in browser localStorage and does not talk to Veilid at all.
- The Go Veilid client (`src-tauri/background/client/veilid_client.go`) is an **unverified hand-rolled JSON-RPC stub** to an external daemon at `http://localhost:5959`. Nothing in this repo vendors, starts, or proves that daemon or its RPC interface.
- Media references returned by the sidecar are **local mock-media references** (a SHA-256 of the payload, stored in local SQLite), not IPFS hashes. The sidecar's `-encrypt-key` flag is simulated and ignored — it does not encrypt the database.

## What is actually here

- **Frontend** — React 18 + TypeScript + Vite + Tailwind (`src/`: `main.tsx`, `components/`, `hooks/`, `services/`, vitest tests in `src/test/`). Package name: `veilid-reddit-myspace`.
- **Desktop shell** — Tauri 2 (`src-tauri/`): strict v2 capabilities schema (`shell:default`), native system tray integration (`tray-icon` cargo feature) with window toggling and graceful sidecar/server child process termination.
- **Go sidecar & Lattice** — local service holding SQLite cache, Veilid client routing, and the Bobcoin account-chain lattice (`src-tauri/background/`). Includes a cross-platform compilation matrix script `scripts/build_sidecar_matrix.sh` targeting Linux (x86_64, aarch64), Windows, and macOS with symbol stripping and dual-staging for Tauri v2 bundles.
- **Collaborative Subreddit Wiki (CRDT)** — state-based Conflict-Free Replicated Data Type (`SubredditCRDTDoc` in `src/services/crdt.ts` and `SubredditWikiTab` in `src/components/SubredditWikiTab.tsx`) featuring Last-Write-Wins (LWW) element registers, Lamport logical clocks, deterministic lexicographical peer tie-breaking, and tombstoned moderator sets.
- **Mobile experiments** — `mobile-bootstrap/`, `my_space_mobile/`.
- A large paper trail: `API_DOCUMENTATION.md`, `TESTNET.md`, `STAGING.md`, `DEPLOY.md`, `UAT.md`, `RELEASE_NOTES_V1.1.0.md`, `DAO_ANALYSIS.md`, `MESSAGING_ANALYSIS.md`, and more.

The Veilid node itself is an **external prerequisite**: the app expects a running `veilid-core` daemon (see the old quick-start in git history); nothing in this repo vendors or starts one, and the P2P feature set (sovereign identity, AppMessage messaging, P2P discovery) is design + integration scaffolding around that daemon, exercised at most on a local testnet setup (`TESTNET_MANIFEST.json`, `verify_testnet_ui.js`).

## Development

Prerequisites: Node 20+, Go 1.22+ (with CGO), Rust/Cargo for Tauri, and a locally running Veilid core.

```bash
npm install
npm run dev          # frontend only
npm run tauri dev    # desktop shell
npm test             # vitest
./build-all.sh
```
