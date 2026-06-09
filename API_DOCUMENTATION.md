# API Documentation - Veilid Reddit MySpace Sidecar

This document details the HTTP API endpoints exposed by the Go sidecar (default `127.0.0.1:1337`).

## Base URL
`http://127.0.0.1:1337`

## Endpoints

### 1. GET `/status`
Returns the current network and node status.

**Response:** `200 OK`
```json
{
  "connected_peers": 42,
  "node_id": "vld_node_88888888",
  "dht_size": 123456,
  "protocol": "Veilid v0.1.0"
}
```

### 2. POST `/publish`
Publishes a user profile to the Veilid DHT.

**Request Body:**
```json
{
  "username": "satoshi",
  "myspace_schema": {
    "theme_css_base64": "...",
    "html_content": "...",
    "background_image": "...",
    "top_eight_friends": ["..."]
  }
}
```

**Response:** `200 OK`
```json
{
  "dht_key": "vld_dht_key_..."
}
```

### 3. GET `/fetch?key=<DHT_KEY>`
Fetches a profile from the network or local cache.

**Response:** `200 OK`
```json
{
  "username": "...",
  "myspace_schema": { ... }
}
```

### 4. POST `/register`
Registers a DHT key in the local discovery hub.

**Request Body:**
```json
{
  "dht_key": "...",
  "username": "..."
}
```

### 5. GET `/discovery`
Lists all profiles registered in the discovery hub.

**Response:** `200 OK`
```json
[
  { "dht_key": "...", "username": "..." }
]
```

### 6. POST `/message/send`
Sends a real-time P2P message to another user via Veilid `AppMessage`.

**Request Body:**
```json
{
  "sender_id": "your_vld_key",
  "recipient_id": "their_vld_key",
  "content": "Hello world!",
  "timestamp": "2026-06-05T12:00:00Z"
}
```

**Response:** `200 OK`
```json
{ "status": "sent" }
```

### 7. GET `/message/inbox`
Retrieves all pending real-time messages for the local node.

**Response:** `200 OK`
```json
[
  {
    "id": "...",
    "sender_id": "...",
    "content": "...",
    "timestamp": "..."
  }
]
```

### 8. POST `/identity/generate`
Generates a new sovereign identity (ED25519) using high-entropy random generation.

**Response:** `200 OK`
```json
{
  "dht_key": "vld_key_...",
  "private_key": "...",
  "mnemonic": "..."
}
```

### 9. POST `/identity/import`
Imports an existing sovereign identity from a BIP-39 mnemonic.

**Request Body:**
```json
{ "mnemonic": "..." }
```

### 10. POST `/posts/create`
Creates and signs a new post, propagating it to the Veilid DHT.

**Request Body:**
```json
{
  "post_id": "...",
  "author_id": "...",
  "title": "...",
  "body": "...",
  "target_key": "...",
  "signature": "..."
}
```

### 11. GET `/posts/list?key=<SUBREDDIT_KEY>`
Retrieves and aggregates the latest 50 posts from a specific subreddit key.

### 12. POST `/comments/add`
Adds a cryptographically signed comment to a specific post.

### 13. GET `/comments/list?post_id=<POST_ID>`
Fetches all P2P comments associated with a specific post.

### 14. GET/POST `/dao/proposals`
Lists all governance proposals or publishes a new one.

### 15. POST `/dao/vote`
Casts a weighted vote on a proposal using Quadratic Voting logic.

### 16. GET `/bobcoin/balance?account=<DHT_KEY>`
Retrieves the current Bobcoin balance and Trust Score for an account.

### 17. POST `/bobcoin/transfer`
Processes a signed Bobcoin transfer block.

### 18. GET `/bobcoin/faucet?account=<DHT_KEY>`
Requests simulated testnet funds (1000 BOB) for an account.

## P2P Interaction Details
The sidecar uses the following Veilid JSON-RPC methods for network operations:
- `veilid.routing_context_set_dht_value`: Used to publish signed profile registries to the DHT.
- `veilid.routing_context_get_dht_value`: Used to retrieve profile registries from the network.
- `veilid.app_message`: Used to send real-time P2P messages to a target node ID.

---
*Note: During the prototype phase, Veilid interactions are partially simulated if the `veilid-core` daemon is unreachable.*
