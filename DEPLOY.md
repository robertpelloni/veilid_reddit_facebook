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

## Test Network Deployment (UAT)
To deploy and test on a network of nodes for User Acceptance Testing:

### 1. Multi-Node Local Setup
For testing on a single machine with multiple "nodes":
1.  **Clone with Isolation:** Copy the repository into separate directories (e.g., `node1/`, `node2/`).
2.  **Unique Veilid Configs:** Each directory must have a unique `veilid-core` config pointing to different local ports and storage paths.
3.  **Sidecar Port Offsets:** If running multiple sidecars, modify the `DefaultSidecarPort` in `src-tauri/background/main.go` for each node to prevent port collisions.
4.  **Run:** Start each node's sidecar and frontend independently.

### 2. Physical Network Setup
1.  **Build All:** Run the automated build script on your build machine:
    ```bash
    ./build-all.sh
    ```
2.  **Distribute Binaries:** Distribute the generated sidecar (from `src-tauri/bin/`) and the Tauri bundle to the test devices.
3.  **Bootstrap:** Ensure at least one node is configured as a "bootstrap node" with a static IP or reachable DHT key so others can join the network.
4.  **UAT Scenarios:** Execute the test cases defined in `UAT.md`.

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

## CI/CD Pipeline

The project includes a comprehensive automated pipeline for testing and deployment using GitHub Actions.

### Automated Testing
Every push and pull request to the `main` branch triggers the **Test Suite** workflow:
1. **Backend Tests:** Executes all Go unit and integration tests for the sidecar service.
2. **Frontend Tests:** Executes all Vitest component tests for the React application.
Ensuring all tests pass is a prerequisite for merging and deployment.

### Automated Releases
Whenever a new tag matching `v*` is pushed to the repository, the `Release` workflow is triggered:
1. **Multi-platform Build:** It concurrently builds the application for macOS, Ubuntu, and Windows.
2. **Go Sidecar Compilation:** It automatically compiles the Go backend for the target platform and architecture, ensuring the correct naming convention for Tauri.
3. **Draft Release:** It creates a new GitHub Release with the bundled installers and sidecar binaries.

### Triggering a Release
To release a new version:
1. Update `VERSION.md` and `CHANGELOG.md`.
2. Commit and push your changes.
3. Create and push a new git tag:
   ```bash
   git tag v0.3.0
   git push origin v0.3.0
   ```
