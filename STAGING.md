# STAGING.md - Staging Environment Configuration

This document outlines the setup for the staging environment of the Veilid-powered social network.

## Staging Network Topology
The staging environment uses a dedicated subset of Veilid nodes to ensure P2P stability before production deployment.

### Staging Bootstrap Nodes
- `vld_stg_bootstrap_1`: `192.168.1.10:5959`
- `vld_stg_bootstrap_2`: `192.168.1.11:5959`

## Environment Offsets
To allow concurrent testing of multiple staging versions on the same hardware, use the following port offsets:

| Service | Default Port | Staging Offset |
| :--- | :--- | :--- |
| Go Sidecar | `1337` | `1338` |
| Frontend (Dev) | `5173` | `5174` |
| Veilid Core | `5959` | `5960` |

## Storage Configuration
Staging data is isolated from production/dev data:
- **SQLite Database:** `veilid_staging.db`
- **Veilid State:** `/var/lib/veilid/staging/`

## Deployment to Staging
1.  **Build:** Execute `./build-all.sh`.
2.  **Config:** Update the `DefaultSidecarPort` in `src-tauri/background/main.go` if needed for the offset.
3.  **Run:** Launch the staging-specific binaries.
4.  **Verification:** Execute the UAT scenarios defined in `UAT.md` within this environment.
