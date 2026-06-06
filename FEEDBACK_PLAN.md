# FEEDBACK_PLAN.md

## Objective
To collect qualitative and quantitative feedback from a small group of early testers to identify usability friction, P2P network reliability issues, and potential feature gaps in the Veilid-powered social network.

## User Recruitment Strategy
1.  **Target Group:** 5-10 users with varying technical backgrounds (from P2P enthusiasts to casual social media users).
2.  **Channels:**
    - Veilid community forums/Discord.
    - Privacy-focused subreddits (e.g., r/privacy, r/decentralized).
    - Open-source developer networks (Tauri, Go).
3.  **Incentives:** Early contributor status, exclusive "Beta Tester" profile badge (recorded in the P2P DHT).

## Testing Phases

### Phase 1: Installation & Setup (Onboarding)
- **Goal:** Verify that the multi-component installation (Tauri + Go Sidecar + Veilid Core) is seamless.
- **Tasks:**
    - Install the application on their primary OS.
    - Create a sovereign identity.
    - Export and re-import identity.

### Phase 2: Social Interaction
- **Goal:** Test the reliability of DHT-based feeds and comments.
- **Tasks:**
    - Follow 3 other testers' profiles.
    - Create 2 posts on their own sovereign subreddit.
    - Comment on at least 5 posts from other users.
    - Upvote/Downvote posts using the DAO governance system.

### Phase 3: Profile Customization (MySpace Ethos)
- **Goal:** Verify the sandbox safety and flexibility of custom CSS/HTML.
- **Tasks:**
    - Apply a custom CSS theme.
    - Embed a piece of HTML (e.g., a static widget).
    - Report any UI breakage or sandboxing escapes.

## Feedback Collection Channels
1.  **Direct Feedback Thread:** A dedicated subreddit within the application (`r/feedback`) where testers can post signed P2P messages.
2.  **Surveys:** A brief Google Form or Typeform focused on the "System Usability Scale" (SUS).
3.  **Bug Reports:** GitHub issues labeled with `feedback-beta`.

## Metrics for Success
- **Time to Onboard:** Should be < 2 minutes.
- **Message Propagation:** Comments should appear on peers' clients within < 30 seconds (network dependent).
- **Zero XSS Escapes:** No reported instances of custom CSS/HTML affecting the host application.

## Next Iteration Planning
Feedback collected will be triaged into the following categories:
- **Critical Bugs:** Immediate fixes for v1.1.1.
- **UX Polish:** Refinements for v1.2.0.
- **New Features:** Long-term roadmap items for v2.0.0.
