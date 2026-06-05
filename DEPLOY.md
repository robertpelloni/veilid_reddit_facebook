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
2. **Build All:** Run the automated build script:
   ```bash
   ./build-all.sh
   ```
3. **Distribute Binaries:** Distribute the built sidecar and Tauri app to your test nodes.
4. **Discovery:** Use the built-in "Discovery Hub" to find other active profiles on the network.
5. **Monitoring:** View the "Network Status" indicator in the app header for real-time peer count.

## Production
(Coming soon - will involve bundled binaries and secure key management)
