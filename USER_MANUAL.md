# Veilid Reddit MySpace - User Manual

Welcome to the future of sovereign social networking. This guide will help you navigate, customize, and participate in a completely serverless P2P social fabric built on the Veilid protocol.

## 1. Getting Started

### Launching the App
When you open the application, the Go background service (the "sidecar") starts automatically. This service connects you to the Veilid P2P network.

### Your Sovereign Identity
On your first launch, a unique **Identity Key** is generated for you. This key represents your sovereign space on the network. You can find your key in the top right corner of the dashboard.
- **Privacy Note:** Your key does not reveal your IP address or real-world identity.

---

## 2. Managing Your Profile (The MySpace Experience)

Every user has their own "Subreddit" which also functions as a personal MySpace-style profile page.

### Customizing Appearance
Navigate to the **Profile Editor** section:
1. **Username:** Choose a handle that others will see.
2. **Custom CSS:** Inject your own styles! You can change backgrounds, fonts, and layouts.
   - *Example:* `body { background-color: #000; color: #0f0; }`
3. **Custom HTML:** Write the content of your page. Use headings, paragraphs, and divs to tell your story.

### Publishing to Veilid
Click **Publish Profile** to sign and distribute your profile to the Veilid Distributed Hash Table (DHT). Once published, anyone with your Identity Key can view your custom page.

---

## 3. Browsing and Discovery

### The Home Feed
Your **Home Feed** aggregates posts from all the users you have subscribed to. It is sorted chronologically, putting the latest P2P updates at the top.

### Subscribing to Others
To follow someone, you need their **Identity Key**.
1. Paste the key into the **Join Subreddit** box.
2. Click **Subscribe**.
3. Their posts will now appear in your feed, and you can view their custom profile.

### Finding New People
Use the **Discovery Hub** to see a list of users who have recently announced themselves on the network.
- Click **Select** next to a discovered user to quickly view their profile or subscribe.
- Click **Register My Profile on Hub** if you want others to be able to find you through the discovery mechanism.

---

## 4. Collaborative Subreddit CRDT Wiki

The dashboard includes a real-time, decentralized collaborative Subreddit Wiki powered by state-based Conflict-Free Replicated Data Types (CvRDT).

### How the CRDT Engine Works
- **Last-Write-Wins (LWW) Registers:** Each field (`title`, `rules`, `sidebar`) tracks a monotonic Lamport logical timestamp and the editing `peerId`. Edits merge deterministically without central conflict resolution servers.
- **Deterministic Peer Tie-Breaking:** If two peers edit a field simultaneously with the exact same logical timestamp, lexicographical peer ID tie-breaking guarantees every client converges to the identical value across the network.
- **LWW Moderator Set:** Subreddit moderators are tracked in an add/remove tombstoned set. Adding a moderator or removing them preserves causality regardless of network delays or out-of-order syncs.

### Working with the CRDT Wiki
1. **Commit Local Changes:** Update the title, community rules, or sidebar markdown and click **Commit Local Changes** to update the local Lamport clock and state.
2. **Export State:** Click **Export State** to copy the serialized JSON state representation directly to your clipboard.
3. **Merge Remote State:** Paste another peer's exported CRDT JSON into the **Merge Remote Peer CRDT State** box and click **Merge Deterministically**. The engine automatically reconciles concurrent changes with zero data loss.
4. **Moderator Management:** Add new moderator public keys to the LWW set. Active moderators are instantly visible as verified badges.

---

## 5. Automated Sidecar Matrix Architecture

The application relies on a Go sidecar providing system services, P2P network routing, and cryptographic block-lattice accounting.

### Multi-Platform Compilation Matrix
The compilation process is managed by `scripts/build_sidecar_matrix.sh`:
- **Target Triple Detection:** Automatically infers the Rust host triple (e.g., `x86_64-unknown-linux-gnu`, `aarch64-unknown-linux-gnu`, `x86_64-pc-windows-msvc`, `x86_64-apple-darwin`, `aarch64-apple-darwin`) or accepts an explicit argument.
- **Tauri v2 Staging:** In Tauri v2, `bundle.externalBin` looks for binary targets staged in both `src-tauri/bin/` and `src-tauri/`. The script compiles the entire `./src-tauri/background` package and stages it simultaneously to satisfy cargo checks and desktop packaging.
- **Compiler Optimizations:** Uses `-ldflags="-s -w"` to strip debug symbols and reduce sidecar footprint.

---

## 6. Interaction and Safety

### Voting and Comments
DAO quadratic voting is secured with ed25519 cryptographic signatures and liquid delegation power calculation.

### Security and Sandboxing
To keep you safe from malicious code, all custom profiles are rendered in a **Strict Sandbox**.
- User-provided scripts (JavaScript) are **disabled**.
- Profiles cannot access your local files or identity keys.
- You can browse even the most "extreme" CSS customizations with confidence.

---

## 7. Troubleshooting

- **"Failed to publish profile"**: Ensure the Go sidecar is running (it should start automatically). Check if you have an active internet connection.
- **"Empty Feed"**: You haven't subscribed to anyone yet! Try registering your profile and looking for others in the Discovery Hub.
- **Network Status**: Check the "Network Status" indicator in the header. If it shows 0 peers, you might be behind a restrictive firewall or need to wait a few moments for DHT discovery.

---
*The P2P Revolution is Sovereign. Own your data.*
