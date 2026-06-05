# DEPLOY.md

## Environment Setup
- **Rust/Cargo:** Required for `veilid-core` and Tauri.
- **Go v1.22+:** Required for the background sidecar. (Requires CGO and a C compiler like GCC or Clang for SQLite support).
- **Node.js & npm/pnpm:** Required for the React frontend.
- **Veilid Core:** Must be running locally or accessible via network for real-time P2P operations.

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

## Network Deployment (UAT)
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
- **Sandboxing:** User profiles are rendered in a verified null-origin `<iframe>` using `srcdoc` and a strict `sandbox` attribute to prevent XSS and local data exfiltration.
- **RPC Isolation:** The Go sidecar listens only on `127.0.0.1`. CORS is restricted to valid Tauri application origins.
- **Veilid Privacy:** Enable onion routing in `veilid-core` to protect node IP addresses.

### 3. Key Management
- Sovereign identities are derived from Veilid Crypto Routing Pairs.
- **Backup:** Identity keys are persisted in the browser's `localStorage` and the sidecar's SQLite cache. Use the "Export Identity" feature (see manual) for manual backups.

## CI/CD Pipeline

The project includes a comprehensive automated pipeline for testing and deployment using GitHub Actions.

### Automated Testing
Every push and pull request to the `main` branch triggers the **Test Suite** workflow:
1. **Backend Tests:** Executes all Go unit and integration tests.
2. **Frontend Tests:** Executes all Vitest component tests.

### Automated Releases
Whenever a new tag matching `v*` is pushed, the `Release` workflow is triggered:
1. **Multi-platform Build:** Concurrently builds for macOS, Ubuntu, and Windows.
2. **Sidecar Compilation:** Automatically compiles the Go backend for the target architecture.
3. **Artifact Distribution:** Creates a draft GitHub Release with bundled installers and binaries.
