# Veilid Messenger (Reference) Analysis Report

## Overview
This report analyzes the `veilidchat` reference implementation (Flutter/Dart) to identify best practices and features for achieving "Telegram-grade" decentralized messaging within the `veilid_reddit_facebook` project.

## Core Features identified in VeilidChat
1.  **Schema-driven Messaging:** Uses Protobuf (`veilidchat.proto`) to define message types:
    - `Text`: Standard text messages.
    - `Secret`: Encrypted payloads.
    - `ControlMessages`: Read receipts, deletions, and membership changes.
2.  **Identity & Discovery:**
    - **Out-of-band Invitations:** QR codes or data blobs shared outside the network to establish initial trust and exchange keys.
    - **SuperIdentities:** JSON-based extended identity data.
3.  **Conversations:**
    - **DirectChat:** 1-1 encrypted channels using Unicast DHT keys.
    - **GroupChat:** Multi-party channels with permissions and membership management.
4.  **Encryption:** End-to-end encryption using Diffie-Hellman of identities.

## Functionality to Implement in Go Sidecar
- [ ] **Protobuf/JSON Schema Alignment:** Expand our Go `Message` struct to support Kind/Type, EncyptedPayload, and Control signals.
- [ ] **E2EE Layer:** Add crypto helpers in Go to handle X25519 key exchange based on Veilid Routing Pairs.
- [ ] **Invitation System:** Implement endpoints for generating and accepting contact invitations to bypass the Sybil problem.
- [ ] **Local-First State:** Ensure messages are reconciled between local SQLite and P2P DHT logs.

## Conclusion
The `veilidchat` submodule serves as a highly valuable architectural reference. Since the current project uses a different tech stack (Go/React), the submodule itself is functionally redundant for our build process and will be removed once the analysis is fully integrated into our implementation roadmap.
