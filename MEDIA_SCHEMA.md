# Encrypted Media Storage Schema

## Overview
This document outlines the schema and integration strategy for Encrypted Media Storage using IPFS/Hypercore to support large-file media attachments within the Veilid MySpace architecture.

## Requirements
- **Decentralization:** Media files must be stored on a decentralized network (IPFS or Hypercore) to prevent relying on centralized servers.
- **Privacy/Encryption:** Files must be encrypted client-side before upload. The decryption key must only be shared with authorized recipients via the Veilid P2P network.
- **Performance:** Large files (videos, high-res images) should not bloat the Veilid DHT (which has a 64KB block limit).

## Architecture

### 1. Client-Side Encryption
When a user uploads a file:
1. Generate a random 256-bit AES-GCM key.
2. Encrypt the file data using the key.
3. Hash the ciphertext (SHA-256) to verify integrity.

### 2. IPFS/Hypercore Storage
1. Upload the encrypted ciphertext to IPFS or Hypercore.
2. Retrieve the Content Identifier (CID) or Hypercore key.

### 3. Veilid DHT Integration
The metadata for the media is stored in the Veilid DHT or sent via Veilid AppMessage to recipients.

**Schema:**
```json
{
  "media_id": "uuid-v4",
  "type": "image/jpeg",
  "size": 1048576,
  "storage_network": "ipfs",
  "cid": "Qm...",
  "encryption": {
    "algorithm": "AES-GCM-256",
    "key": "base64-encoded-key",
    "iv": "base64-encoded-iv"
  },
  "hash": "sha256-hash-of-ciphertext"
}
```

### 4. Decryption
1. Authorized recipient retrieves the metadata JSON from the Veilid DHT.
2. Uses the `cid` to fetch the encrypted payload from IPFS/Hypercore.
3. Uses the provided `key` and `iv` to decrypt the media locally.
4. Renders the decrypted media in the UI.

## Implementation Steps
1. Add IPFS/Hypercore light node capabilities to the Go Sidecar.
2. Expose RPC endpoints (`/media/upload_ipfs`, `/media/download_ipfs`) to the frontend.
3. Update React frontend to handle the two-step encryption+upload flow.
