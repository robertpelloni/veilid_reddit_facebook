# Release Notes - v1.1.0-prod "Gold Master"

## Overview
We are proud to announce the Gold Master release of the Veilid-powered decentralized social network. This version marks the transition from a technical prototype to a fully functional, peer-to-peer social fabric with integrated economic and governance layers.

## Key Features

### 1. Sovereign Identity & Security
- **Ed25519 Authentication:** Every post, comment, and vote is cryptographically signed using sovereign keys derived from the Veilid network.
- **Identity Vault:** Local storage of private keys is secured using AES-256-GCM with user-defined PIN/Passphrases.
- **Onion-First Routing:** All network traffic defaults to 3-hop private circuits to protect user IP addresses.

### 2. Decentralized Social Fabric
- **Subreddits as Sovereign Spaces:** Every user hosts their own customizable subreddit.
- **Multi-Writer DHT Comments:** Real-time, serverless comment threads integrated directly into the Veilid DHT.
- **P2P Messaging:** Asynchronous, encrypted messaging between nodes.

### 3. Economic & Governance Layer
- **Bobcoin Integration:** Seamlessly integrated Bobcoin Lattice for peer-to-peer tipping and value transfer.
- **Quadratic Voting DAO:** A fair, decentralized governance system where voting power is influenced by Bobcoin "Trust Scores" rather than raw wealth.
- **Liquid Delegation:** Support for delegating voting power to trusted peers within the network.

### 4. MySpace-Style Personalization
- **Sandboxed CSS/HTML:** Complete UI customization for profile pages, safely rendered in a strict null-origin sandbox to prevent tracking and XSS.

## Technical Specifications
- **P2P Protocol:** Veilid
- **Frontend:** React, TailwindCSS, Vite
- **Shell:** Tauri
- **Backend Sidecar:** Go (Golang)
- **Database:** SQLite (Local Cache)

## Installation & Deployment
Refer to `DEPLOY.md` for detailed installation instructions across Linux, macOS, and Windows. Release artifacts are available in the `release/v1.1.0-prod/` directory.

---
*The P2P Revolution is Here. Own your data. Own your identity.*
