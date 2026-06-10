# DEPLOY.md

## Environment Setup
To automate the installation of system libraries and configuration for Ubuntu (especially WebKitGTK 4.0 compatibility on 24.04), run:

```bash
chmod +x setup-env.sh
./setup-env.sh
```

- **Rust/Cargo:** Required for `veilid-core` and Tauri.
- **Go v1.25+:** Required for the background sidecar and Bobcoin Lattice integration. (Requires CGO and a C compiler like GCC or Clang for SQLite support).
- **Node.js & npm/pnpm:** Required for the React frontend.
- **Veilid Core:** Must be running locally or accessible via network for real-time P2P operations.
- **Bobcoin Submodule:** Integrated as a core library for the decentralized economic layer.

## Local Development
1. Install dependencies:
   ```bash
   npm install
   go mod download
   ```
2. Build the Go sidecar (requires target triple suffix):
   ```bash
   # Example for x86_64 Linux
   mkdir -p src-tauri/bin
   # Note: Include bobcoin_handlers.go and other sidecar source files
   go build -o src-tauri/bin/sidecar-x86_64-unknown-linux-gnu ./src-tauri/background/*.go
   ```
3. Start the application:
   ```bash
   npm run tauri dev
   ```

## Production Deployment

### 1. Hardened Builds
For production, use the release flags for both the sidecar and the Tauri shell. Ensure the sidecar is placed in `src-tauri/bin/` with the correct target triple suffix.

```bash
# Build Go sidecar with stripping and optimizations
TARGET_TRIPLE=$(rustc -Vv | grep host | cut -d ' ' -f 2)
go build -ldflags="-s -w" -o "src-tauri/bin/sidecar-$TARGET_TRIPLE" ./src-tauri/background/*.go

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

## Release Packaging & Distribution

The build process generates two primary artifacts that must be distributed together:

1.  **Go Sidecar:** Located in `src-tauri/bin/sidecar-<target>`. This is the P2P engine, now including the integrated Bobcoin economic layer.
2.  **Tauri App Bundle:** Located in `src-tauri/target/release/bundle/`. This includes the React UI and the shell logic to launch the sidecar.

### Multi-Node Distribution
To distribute to a network of nodes, use the packaging script to generate a standard release folder:

```bash
chmod +x package-release.sh
./package-release.sh
```

The artifacts will be organized in `release/v<version>/`.

1.  **Distribute:** Share the package containing the installer and the sidecar binary.
2.  **Install:** Run the platform-specific installer (msi, dmg, deb).
3.  **Bootstrap:** Ensure the `veilid-core` on the target machine points to a shared bootstrap node (see `TESTNET.md`).

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

## UAT and Staging Environments
For detailed instructions on setting up non-production environments, refer to `UAT.md`, `STAGING.md`, and `TESTNET.md`.
