# DEPLOY.md

## Environment Setup
- **Rust/Cargo:** Required for `veilid-core` and Tauri.
- **Go v1.22+:** Required for the background sidecar.
- **Node.js & npm/pnpm:** Required for the React frontend.
- **Veilid Core:** Must be running locally or accessible via network.

## Deployment Steps
1. Install dependencies: `npm install` and `go mod download`.
2. Build the Go sidecar: `go build -o bin/sidecar ./src-tauri/background`.
3. Start the application: `npm run tauri dev`.
