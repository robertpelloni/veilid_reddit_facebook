# Veilid Reddit MySpace (veilid_reddit_facebook)

A prototype desktop social app in the shape of "Reddit meets MySpace" —
threaded posts plus heavily personalized profile pages — designed to run
over the Veilid P2P network instead of a central server. (The repo name
says "facebook"; the app itself is the Reddit/MySpace concept in
`VISION.md`.)

## What is actually here

- **Frontend** — React 18 + TypeScript + Vite + Tailwind (`src/`:
  `main.tsx` ~19 KB, `components/`, `hooks/`, `services/`, vitest tests in
  `src/test/`). Package name: `veilid-reddit-myspace`.
- **Desktop shell** — Tauri 2 (`src-tauri/`): strict v2 capabilities schema (`shell:default`), native system tray integration (`tray-icon` cargo feature) with window toggling and graceful sidecar/server child process termination.
- **Go sidecar & Lattice** — local service holding SQLite cache, Veilid client routing, and the Bobcoin account-chain lattice (`src-tauri/background/`). Includes cross-platform compilation matrix script `scripts/build_sidecar_matrix.sh` targeting Linux (x86_64, aarch64), Windows, and macOS with symbol stripping and dual-staging for Tauri v2 bundles.
- **Collaborative Subreddit Wiki (CRDT)** — state-based Conflict-Free Replicated Data Type (`SubredditCRDTDoc` in `src/services/crdt.ts` and `SubredditWikiTab` in `src/components/SubredditWikiTab.tsx`) featuring Last-Write-Wins (LWW) element registers, Lamport logical clocks, deterministic lexicographical peer tie-breaking, and tombstoned moderator sets.
- **Mobile experiments** — `mobile-bootstrap/`, `my_space_mobile/`.
- A large paper trail: `API_DOCUMENTATION.md`, `TESTNET.md`,
  `STAGING.md`, `DEPLOY.md`, `UAT.md`, `RELEASE_NOTES_V1.1.0.md`,
  `DAO_ANALYSIS.md`, `MESSAGING_ANALYSIS.md`, and more.

The Veilid node itself is an **external prerequisite**: the app expects a
running `veilid-core` daemon (see the old quick-start in git history);
nothing in this repo vendors or starts one, and the P2P feature set
(sovereign identity, AppMessage messaging, P2P discovery) is design +
integration scaffolding around that daemon, exercised at most on a local
testnet setup (`TESTNET_MANIFEST.json`, `verify_testnet_ui.js`).

Version numbers in the repo disagree: `package.json` says `1.1.0-prod`,
`VERSION.md` says `1.1.3-prod`, and a June 2026 commit is titled "Gold
Master Final Polish". There are no GitHub releases attached to the repo,
and no license file despite the old README's "open-source" framing — treat
the version labels as agent-era staging names, not shipped releases.

## Development

Prerequisites: Node 20+, Go 1.22+ (with CGO), Rust/Cargo for Tauri, and a
locally running Veilid core.

```bash
npm install
npm run dev          # frontend only
npm run tauri dev    # desktop shell
npm test             # vitest
./build-all.sh
```

## Status

Burst of agent-driven development in June 2026; dormant since (latest
commit is an automated checkpoint, 2026-10-19). A staging prototype with a
real frontend and shell — not a launched decentralized social network.
