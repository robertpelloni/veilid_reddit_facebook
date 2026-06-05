# Veilid Reddit MySpace

**A Decentralized, Serverless, Sovereign Social Fabric.**

Veilid Reddit MySpace is an open-source social network that combines the content aggregation and threaded discussions of **Reddit** with the hyper-personalization of **MySpace**, built entirely on the **Veilid P2P network protocol**.

Unlike traditional social networks, there are no central servers, no trackers, and no corporate gatekeepers. Every user owns their data, their identity, and their space.

---

## 🚀 Key Features

- **Sovereign Identity:** Your identity is a cryptographic Routing Pair on the Veilid network. You own your keys; you own your presence.
- **MySpace Personalization:** Design your own "Subreddit" (profile) using custom CSS and HTML. Express yourself without constraints.
- **Secure Sandboxing:** User-provided styles and content are rendered in a strictly isolated, null-origin environment to ensure total security.
- **Decentralized Discovery:** Find and subscribe to other sovereign subreddits via a local registry and P2P discovery hub.
- **Real-time P2P Messaging:** Send and receive private messages directly between nodes using the Veilid AppMessage protocol.
- **Local-First Architecture:** All your data, subscriptions, and cached feeds stay on your device in a secure SQLite database.

---

## 🏗️ Architecture

The application uses a modular, multi-process architecture designed for security and P2P performance:

1.  **Frontend (React/TypeScript):** A modern, responsive UI built with Vite and Tailwind CSS.
2.  **Desktop Shell (Tauri):** A lightweight Rust-based wrapper that provides native desktop capabilities.
3.  **Background Sidecar (Go):** A high-performance service that manages the local SQLite cache and communicates with the `veilid-core` daemon via JSON-RPC.

---

## 🚀 Deployment

The project supports several deployment targets depending on your environment:

- **Local Development:** Ideal for UI work and local testing. Follow the [Quick Start](#🛠️-quick-start) below.
- **Staging Environment:** For team-wide integration testing on a private P2P subset. See [STAGING.md](STAGING.md).
- **Public Testnet:** For verifying P2P propagation over the public internet. See [TESTNET.md](TESTNET.md).
- **Production:** Hardened builds for public release. See [DEPLOY.md](DEPLOY.md).

The CI/CD pipeline (GitHub Actions) automatically handles multi-platform builds and releases. Refer to the [CI/CD Pipeline](DEPLOY.md#cicd-pipeline) documentation for details.

---

## 🛠️ Quick Start

### Prerequisites
- [Go v1.22+](https://golang.org/dl/) (Requires CGO and a C compiler like GCC)
- [Node.js v20+](https://nodejs.org/)
- [Rust & Cargo](https://rustup.rs/) (For Tauri and Veilid)
- [Veilid Core](https://veilid.com/download/) (Must be running locally or accessible via network)

### Installation
1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/robertpelloni/veilid_reddit_facebook.git
    cd veilid_reddit_facebook
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    go mod download
    ```
3.  **Run in Development Mode:**
    ```bash
    npm run tauri dev
    ```

---

## 📖 Documentation Map

For more in-depth information, please refer to our comprehensive documentation suite:

- **For Users:**
  - [User Manual](USER_MANUAL.md): How to use the app and customize your profile.
  - [UAT Plan](UAT.md): Scenarios for verifying core functionality.
- **For Developers:**
  - [API Documentation](API_DOCUMENTATION.md): Details on the Go sidecar's HTTP endpoints.
  - [Deployment Guide](DEPLOY.md): Hardened production build and CI/CD instructions.
  - [Roadmap](ROADMAP.md): Project milestones and future phases.
  - [Memory](MEMORY.md): Internal architectural traits and design choices.
- **Project Vision:**
  - [Vision Statement](VISION.md): The core philosophy behind the project.
  - [Ideas](IDEAS.md): Aggressive ideas for future expansion.

---

## 🤝 Contributing

We follow a **Continuous Autonomous Execution** protocol. For more details on the engineering standards and agentic workflows, see [AGENTS.md](AGENTS.md).

---

## 📄 License

This project is open-source. See the repository for licensing details.

*Built with ❤️ for the P2P Revolution.*
