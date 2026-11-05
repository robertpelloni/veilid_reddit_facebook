/**
 * CRDT Engine for Collaborative Subreddit & Wiki Editing over Veilid P2P
 *
 * Implements a state-based Conflict-Free Replicated Data Type (CvRDT)
 * using Last-Write-Wins (LWW) element registers with Lamport logical clocks
 * and deterministic peer ID tie-breaking.
 */

export interface CRDTRegister<T> {
  value: T;
  timestamp: number;
  peerId: string;
}

export interface SubredditWikiState {
  title: CRDTRegister<string>;
  rules: CRDTRegister<string>;
  sidebar: CRDTRegister<string>;
  moderators: Record<string, CRDTRegister<boolean>>; // LWW element set (tombstoned when value=false)
}

export class SubredditCRDTDoc {
  public peerId: string;
  private state: SubredditWikiState;

  constructor(peerId: string, initialTitle: string = 'Sovereign Subreddit') {
    this.peerId = peerId;
    this.state = {
      title: { value: initialTitle, timestamp: 0, peerId },
      rules: { value: '', timestamp: 0, peerId },
      sidebar: { value: '', timestamp: 0, peerId },
      moderators: {
        [peerId]: { value: true, timestamp: 0, peerId }
      }
    };
  }

  public getTitle(): string {
    return this.state.title.value;
  }

  public getRules(): string {
    return this.state.rules.value;
  }

  public getSidebar(): string {
    return this.state.sidebar.value;
  }

  public getActiveModerators(): string[] {
    return Object.entries(this.state.moderators)
      .filter(([_, reg]) => reg.value)
      .map(([mod]) => mod);
  }

  public setTitle(newTitle: string, timestamp: number = Date.now()): void {
    if (this.shouldUpdate(this.state.title, timestamp, this.peerId)) {
      this.state.title = { value: newTitle, timestamp, peerId: this.peerId };
    }
  }

  public setRules(newRules: string, timestamp: number = Date.now()): void {
    if (this.shouldUpdate(this.state.rules, timestamp, this.peerId)) {
      this.state.rules = { value: newRules, timestamp, peerId: this.peerId };
    }
  }

  public setSidebar(newSidebar: string, timestamp: number = Date.now()): void {
    if (this.shouldUpdate(this.state.sidebar, timestamp, this.peerId)) {
      this.state.sidebar = { value: newSidebar, timestamp, peerId: this.peerId };
    }
  }

  public addModerator(modPeerId: string, timestamp: number = Date.now()): void {
    const current = this.state.moderators[modPeerId];
    if (!current || this.shouldUpdate(current, timestamp, this.peerId)) {
      this.state.moderators[modPeerId] = { value: true, timestamp, peerId: this.peerId };
    }
  }

  public removeModerator(modPeerId: string, timestamp: number = Date.now()): void {
    const current = this.state.moderators[modPeerId];
    if (!current || this.shouldUpdate(current, timestamp, this.peerId)) {
      this.state.moderators[modPeerId] = { value: false, timestamp, peerId: this.peerId };
    }
  }

  /**
   * Deterministic merge between two CRDT registers using Last-Write-Wins (LWW)
   * and lexicographical peer ID comparison for tie-breaking.
   */
  private shouldUpdate<T>(current: CRDTRegister<T>, nextTimestamp: number, nextPeerId: string): boolean {
    if (nextTimestamp > current.timestamp) {
      return true;
    }
    if (nextTimestamp === current.timestamp) {
      return nextPeerId >= current.peerId;
    }
    return false;
  }

  private mergeRegister<T>(local: CRDTRegister<T>, remote: CRDTRegister<T>): CRDTRegister<T> {
    if (this.shouldUpdate(local, remote.timestamp, remote.peerId)) {
      return { ...remote };
    }
    return { ...local };
  }

  /**
   * Merge another peer's CRDT document state into this document.
   * Satisfies associativity, commutativity, and idempotency.
   */
  public merge(remoteState: SubredditWikiState): void {
    this.state.title = this.mergeRegister(this.state.title, remoteState.title);
    this.state.rules = this.mergeRegister(this.state.rules, remoteState.rules);
    this.state.sidebar = this.mergeRegister(this.state.sidebar, remoteState.sidebar);

    // Merge moderators LWW map
    for (const [modId, remoteReg] of Object.entries(remoteState.moderators || {})) {
      const localReg = this.state.moderators[modId];
      if (!localReg) {
        this.state.moderators[modId] = { ...remoteReg };
      } else {
        this.state.moderators[modId] = this.mergeRegister(localReg, remoteReg);
      }
    }
  }

  public exportState(): SubredditWikiState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public serialize(): string {
    return JSON.stringify(this.state);
  }

  public static deserialize(peerId: string, json: string): SubredditCRDTDoc {
    const doc = new SubredditCRDTDoc(peerId);
    doc.state = JSON.parse(json);
    return doc;
  }
}
