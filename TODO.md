# TODO.md

## Post-1.1.0 Refinement
- [ ] Refactor `src/main.tsx` into modular React hooks. — NOT DONE: `main.tsx` is still a 451-line monolith (some hooks were extracted to `src/hooks/`, the main file was not refactored).
- [x] Add unit tests for `FeedAggregator` service.
- [x] Implement "Identity Export" UI for Routing Pair backup.

## UI/UX Enhancements
- [x] Add more default MySpace-style themes.
- [x] Implement "Top 8" friends visualization component.
- [x] Integrated media player for profile background audio.

## Long-term Research
- [x] Explore and implement CRDTs for collaborative subreddit editing (`SubredditCRDTDoc` with Lamport logical clocks & deterministic convergence).
- [x] Implement fallback client simulating Veilid core capabilities for browser-only / offline environments (`BrowserVeilidClient`).
- [ ] Implement direct WASM compilation of Veilid core for native in-browser WebRTC networking.
