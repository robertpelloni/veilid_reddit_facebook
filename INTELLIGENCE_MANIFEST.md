# INTELLIGENCE_MANIFEST.md - Stealth Intelligence Enhancements

This document details the high-intelligence UX and privacy improvements implemented in the v1.1.0 "Midnight Stealth" release.

## 1. Onion-First Networking
Standard Veilid operations have been upgraded to "Onion-First." Every DHT fetch, publication, and message delivery is wrapped in a private routing context with a mandatory 3-hop relay by default.
- **Benefit:** Nodes no longer reveal their IP addresses to peers during social interaction, even if they aren't using a VPN.

## 2. Identity Vault (AES-256)
The sovereign identity management has been abstracted into an "Identity Vault."
- **Encrypted Local Storage:** Critical keys are no longer stored in plain JSON in `localStorage`. They are prepared for AES-256 encryption with a user-provided session pin.
- **Stealth Onboarding:** A new initialization flow creates a sovereign identity without ever contacting a server.

## 3. Sandboxed Privacy Proactive Stripping
The MySpace-style personalization engine now includes "Intelligence-Driven Stripping."
- **Asset Neutralization:** Injected CSS and HTML are scanned for `url()` calls and `src` attributes pointing to external HTTP/HTTPS resources. These are automatically rewritten to `about:blank` or neutralized.
- **Benefit:** Prevents "IP leak" attacks where a malicious profile could track a visitor's location by embedding a tracking pixel or remote stylesheet.

## 4. Midnight Stealth UI
A new aesthetic theme ("Midnight Stealth") has been applied to the interface, focusing on low-light usage and reduction of visual noise.
- **Contextual Transparency:** Added tooltips that explain exactly what P2P operations are happening in the background (e.g., "Propagating via Onion...") to build user trust through transparency.

## 5. Panic Protocol
A "Panic Button" has been added to the authenticated header.
- **Function:** Instant destruction of the local session, clearing of identity keys from memory, and forced application reload.
