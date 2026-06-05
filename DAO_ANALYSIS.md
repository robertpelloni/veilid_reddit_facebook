# DAO Analysis Report

## Core Features & Functionality

The `dao` submodule (LiquidGov) implements a sophisticated governance and coordination engine. Below is a breakdown of its core components and their logic.

### 1. Quadratic Voting (QV)
- **Logic:** Cost to cast `n` votes is `n^2`.
- **Functions:** `calculateVoteCost`, `calculateVotesFromCredits`, `aggregateVotes`.
- **Purpose:** Prevents majority steamrolling by requiring exponential credits for increased voting intensity.

### 2. Liquid Delegation
- **Logic:** Transitive delegation (`A -> B -> C`) with subject-specific granularity.
- **Functions:** `resolveDelegate`, `calculateEffectivePower`, `delegate`, `revokeDelegation`.
- **Purpose:** Allows users to delegate power to subject-matter experts while retaining the ability to revoke instantly.

### 3. Proposal State Machine
- **States:** `DRAFT`, `SPONSORED`, `ACTIVE_VOTING`, `FUNDED`, `REJECTED`, `IN_PROGRESS`, `COMPLETED`.
- **Transitions:** Strict validation of state changes (e.g., `DRAFT` can only move to `SPONSORED`).
- **Purpose:** Manages the lifecycle of governance proposals from inception to completion.

### 4. Crowdfunding & Escrow
- **Logic:** Dominant Assurance logic. Funds are held and released only upon milestone completion.
- **Functions:** `contribute`, `finalizeFunding`, `voteOnMilestone`, `releaseMilestoneFunds`.
- **Purpose:** Links governance decisions to financial execution and accountability.

### 5. Identity & Sybil Resistance
- **Logic:** Endorsement-based verification score.
- **Functions:** `createProfile`, `endorse`, `verifyHuman`.
- **Purpose:** Mimics "Proof of Unique Human" to prevent Sybil attacks in a P2P environment.

---

## Data Models

- **Proposal:** Title, abstract, proposer, committee, status, milestones, budget, votes.
- **Milestone:** Description, budget, completion status, jury votes.
- **User:** Identity, voice credits, reputation, subject-specific delegations.
- **GovernanceCycle:** Tracks discrete periods of voting and funding.

---

## Implementation Strategy for Veilid Port

The logic will be ported to Go within the `src-tauri/background/core` package.

- **Storage:** TypeScript's in-memory maps and SQLite will be replaced by Go's native SQLite integration (`src-tauri/background/storage/sqlite.go`).
- **Networking:** Express REST endpoints will be replaced by the Go HTTP handlers in `main.go`.
- **P2P Synchronization:** Veilid's Multi-Writer DHT will be used to propagate signed proposals and votes, replacing the need for a central server.
