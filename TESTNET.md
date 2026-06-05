# TESTNET.md - Testnet Configuration and Topology

This document details the configuration for the public testnet release of the Veilid-powered social network.

## Network Parameters
The testnet (v1.1.0-testnet) is designed to verify P2P propagation and real-time messaging over the public internet.

### Public Bootstrap Nodes
Testers should configure their local `veilid-core` to use the following bootstrap nodes:
- `vld_testnet_bootstrap_1`: `142.250.190.46:5959`
- `vld_testnet_bootstrap_2`: `172.217.1.14:5959`

## Version Isolation
Testnet nodes are isolated from production and staging via the application protocol string:
- **Protocol String:** `veilid-reddit-myspace-v1-testnet`

## Testing Guidelines
1.  **Peer Discovery:** Check the "Network Status" header to ensure you have connected to at least 3 peers.
2.  **DHT Propagation:** Publish your profile and have a peer on a different network fetch it using your Identity Key.
3.  **Messaging Latency:** Send real-time messages and log the time between "sent" and "received" states across different geographical regions.

## Known Issues (Testnet)
- High latency during DHT lookups on mobile hotspots.
- Occasional peer churn when switching between Wi-Fi and Cellular data.

---
*Participate in the decentralized revolution. Own your data.*
