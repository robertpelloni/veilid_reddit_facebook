# MEMORY.md

## Internal Architectural Observations
- The project uses a Go sidecar to interface with `veilid-core` via JSON-RPC.
- Data structures are designed to fit within Veilid's 64KB DHT block limit.
- UI uses a sandboxed iframe to safely render user-generated CSS/HTML.

## Codebase Traits
- Separation of concerns between Go (networking/storage) and TypeScript (UI).
- Local caching in SQLite for performance.

## Design Preferences
- Use of CRDTs for collaborative features in the future.
- Minimalist but highly customizable frontend.
