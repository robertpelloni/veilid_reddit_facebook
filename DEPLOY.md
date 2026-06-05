# DEPLOY.md

## Environment Setup
- **Rust/Cargo:** Required for `veilid-core` and Tauri.
- **Go v1.22+:** Required for the background sidecar.
- **Node.js & npm/pnpm:** Required for the React frontend.
- **Veilid Core:** Must be running locally or accessible via network.

## Local Development
1. Install dependencies:
   ```bash
   npm install
   go mod download
   ```
2. Build the Go sidecar:
   ```bash
   go build -o bin/sidecar ./src-tauri/background/main.go
   ```
3. Start the application:
   ```bash
   npm run tauri dev
   ```

## Test Network Deployment
To deploy and test on a network of nodes:
1. **Configure Veilid:** Ensure each node has a unique `veilid-core` configuration and can discover other nodes (via bootstrap nodes or local discovery).
2. **Distribute Binaries:** Build the Tauri application for each target platform (`npm run tauri build`).
3. **Connect Nodes:** Share Veilid Crypto Routing IDs or DHT keys between nodes to test subscription and data replication.
4. **Monitoring:** Use `veilid-cli` to inspect DHT states and network connectivity on each node.

## Production
(Coming soon - will involve bundled binaries and secure key management)
