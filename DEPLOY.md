# DEPLOY.md

## Environment Setup
- **Rust/Cargo:** Required for `veilid-core` and Tauri.
- **Go v1.22+:** Required for the background sidecar. (Requires CGO and a C compiler like GCC or Clang for SQLite support).
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

## Production Deployment

### 1. Hardened Builds
For production, use the release flags for both the sidecar and the Tauri shell:
```bash
# Build Go sidecar with stripping and optimizations
go build -ldflags="-s -w" -o bin/sidecar ./src-tauri/background/main.go

# Build Tauri Production Bundle
npm run tauri build
```

### 2. Security Hardening
- **Sandboxing:** The application uses a strictly sandboxed `<iframe>` (`sandbox="allow-same-origin"`) for rendering user-provided CSS and HTML. Ensure that `allow-scripts` is **never** enabled for these frames.
- **RPC Isolation:** The Go sidecar listens only on `127.0.0.1`. Do not expose port `1337` to the public internet.
- **Veilid Privacy:** Ensure `veilid-core` is configured with appropriate privacy settings (onion routing enabled) to protect node IP addresses.

### 3. Key Management
- Sovereign identities are derived from Veilid Crypto Routing Pairs.
- **Backup:** In the current prototype, the local identity key is stored in the browser's `localStorage` and the Go sidecar's SQLite cache.
- **Production recommendation:** Move to a hardware-backed or encrypted-at-rest keystore for the private component of the Routing Pair.

### 4. Infrastructure
- **Bootstrap Nodes:** Deploy at least 3 stable "Seed Nodes" running `veilid-core` to facilitate network discovery.
- **Discovery Hubs:** For a production "r/all" experience, maintain high-availability Discovery Hub nodes that aggregate signed profile announcements.
