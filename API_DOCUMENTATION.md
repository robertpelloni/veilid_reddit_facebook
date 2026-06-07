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

## P2P Interaction Details
The sidecar uses the following Veilid JSON-RPC methods for network operations:
- `veilid.routing_context_set_dht_value`: Used to publish signed profile registries to the DHT.
- `veilid.routing_context_get_dht_value`: Used to retrieve profile registries from the network.
- `veilid.app_message`: Used to send real-time P2P messages to a target node ID.

---
*Note: During the prototype phase, Veilid interactions are partially simulated if the `veilid-core` daemon is unreachable.*
