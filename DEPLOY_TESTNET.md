# DEPLOY_TESTNET.md

## Objective
To deploy the Veilid Reddit MySpace v1.1.0 release to the public testnet for real-world P2P verification.

## 1. Node Configuration
Each test node must be configured to join the isolated testnet:
- **Protocol String:** `veilid-reddit-myspace-v1-testnet`
- **Bootstrap Nodes:** Use the addresses defined in `TESTNET.md`.

## 2. Launch Sequence
1.  **Binary Distribution:** Distribute the `sidecar` and `app` bundles to the test team.
2.  **Sidecar Initialization:** Launch with the `-testnet` flag:
    ```bash
    ./sidecar -testnet -port 1337 -data-dir ./testnet_data
    ```
3.  **Frontend Connection:** Ensure the UI connects to the testnet sidecar instance.

## 3. Monitoring & Performance
- **Latency Tracking:** Use the in-app tooltips to monitor "Onion Circuit" establishment time.
- **Propagation Audit:** Track time-to-discovery for new profiles published to the testnet DHT.
- **Stability Logging:** Sidecar logs in `./testnet_data/sidecar.log` will be collected weekly.

---
*The P2P Revolution is Experimental.*
