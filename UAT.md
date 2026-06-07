# User Acceptance Testing (UAT) Plan - Veilid Reddit MySpace

This document outlines the test scenarios for User Acceptance Testing of the Veilid-powered decentralized social network.

## 1. Testing Objective
Verify that the application meets the core functional requirements and security constraints for a serverless, P2P social experience.

## 2. Test Scenarios

### Scenario A: Sovereign Identity & Profile Publication
- **Action:** Open the app, set a username, and click "Publish Profile".
- **Expected Result:** A unique Identity Key (Veilid DHT key) is generated and displayed. A success message "Profile published to Veilid!" appears.
- **Verification:** Refresh the app; the Identity Key should persist (loaded from local storage/cache).

### Scenario B: MySpace-Style Personalization
- **Action:** In the Profile Editor, enter custom CSS (e.g., `body { background: #000; }`) and HTML (e.g., `<h1>My Space</h1>`). Publish.
- **Expected Result:** The "Sovereign Profile Preview" updates to reflect the new styles and content.
- **Verification:** Ensure that the profile is rendered in a sandboxed iframe (check that it doesn't break the main app UI).

### Scenario C: Discovery & Subscription
- **Action:** Click "Register My Profile on Hub" in the Discovery Hub.
- **Expected Result:** Your username and key appear in the Discovery Hub list for other local nodes to see.
- **Verification:** Copy another user's key from the Hub, paste it into the "Join Subreddit" box, and click "Subscribe". Their profile should now be fetchable.

### Scenario D: Real-Time Messaging
- **Action:** Send a message to a discovered peer using the "Message" feature (simulated/AppMessage).
- **Expected Result:** Status changes to "sent".
- **Verification:** If running two local nodes, the recipient should see the message in their "Inbox".

### Scenario E: Security & Sandboxing
- **Action:** Attempt to publish a profile with a `<script>` tag in the HTML.
- **Expected Result:** The profile renders, but the script **does not execute**.
- **Verification:** Ensure the iframe sandbox `sandbox=""` (the most restrictive policy) is strictly enforced.

## 3. UAT Checklist
- [ ] Application launches and sidecar starts automatically.
- [ ] Identity Key is unique and persists.
- [ ] Custom CSS/HTML renders correctly in the sandbox.
- [ ] Discovery Hub correctly lists active P2P nodes.
- [ ] Feed aggregation correctly blends posts from subscriptions.
- [ ] Messaging API returns "sent" status for P2P messages.

---
*Testing Environment: Test nodes should have access to a shared or local Veilid network.*
