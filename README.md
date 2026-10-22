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
- **Desktop shell** — Tauri 2 (`src-tauri/`, with a `background/` dir).
- **Go sidecar** — intended as a local service holding the SQLite cache
  (`go.mod` depends only on `mattn/go-sqlite3`). Note: **no Go source files
  are committed at the root** — what ships in the repo is a prebuilt
  13 MB `staging_sidecar_bin` binary.
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
