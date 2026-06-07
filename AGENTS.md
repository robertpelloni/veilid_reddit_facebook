# AGENTS.md - System Context for Jules

## Project Overview
An open-source, serverless, peer-to-peer social network combining Reddit's content schema (voting, threads, subreddits) with MySpace-style profile personalization (injected CSS/HTML). Built entirely on top of the Veilid P2P network protocol.

## Tech Stack & Architecture
- **Desktop/Shell Layer:** TypeScript, React, Vite, TailwindCSS, wrapped in Tauri v1.
- **System/Network Service:** Go (Golang) v1.22+ executing as a background sidecar.
- **P2P Layer:** Veilid Core Daemon (`veilid-core`) communicating with the Go layer over JSON-RPC/WebSockets.
- **Local Database:** SQLite3 managed by the Go service for lightning-fast caching of discovered feeds.

## Runtime & Isolation Constraints
1. The Frontend must render user profiles inside a strictly sandboxed, null-origin `<iframe>` to prevent malicious injected CSS/HTML from executing cross-site scripting (XSS) attacks or accessing the Tauri/Veilid RPC bindings.
2. All multi-file modifications must preserve strict separated boundaries between Go network operations and TypeScript UI layers.
3. Every component must be built alongside a corresponding unit test (`*_test.go` or `*.test.tsx`).
