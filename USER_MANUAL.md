# Veilid Reddit MySpace - User Manual

Welcome to the future of sovereign social networking. This guide will help you navigate, customize, and participate in a completely serverless P2P social fabric built on the Veilid protocol.

## 1. Getting Started

### Launching the App
When you open the application, the Go background service (the "sidecar") starts automatically. This service connects you to the Veilid P2P network.

### Your Sovereign Identity
- **Vault Unlock:** On subsequent launches, you will be prompted to enter your Vault Pin. This decrypts your sovereign keys locally. Do not forget this pin, as there is no password reset mechanism in a decentralized network.
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

## 4. Interaction and Safety

### Voting and Comments
(Note: Full decentralized comment trees and voting are coming in the next update. See ROADMAP.md)

### Security and Sandboxing
To keep you safe from malicious code, all custom profiles are rendered in a **Strict Sandbox**.
- User-provided scripts (JavaScript) are **disabled**.
- Profiles cannot access your local files or identity keys.
- You can browse even the most "extreme" CSS customizations with confidence.

---

## 5. Troubleshooting

- **"Failed to publish profile"**: Ensure the Go sidecar is running (it should start automatically). Check if you have an active internet connection.
- **"Empty Feed"**: You haven't subscribed to anyone yet! Try registering your profile and looking for others in the Discovery Hub.
- **Network Status**: Check the "Network Status" indicator in the header. If it shows 0 peers, you might be behind a restrictive firewall or need to wait a few moments for DHT discovery.

---
*The P2P Revolution is Sovereign. Own your data.*
