import { describe, it, expect } from 'vitest';
import { SubredditCRDTDoc } from './crdt';

describe('Collaborative CRDT Multi-Replica Convergence Simulation', () => {
  it('converges across 3 concurrent offline replicas merging in different orders', () => {
    // 3 peers: Node A, Node B, Node C
    const peerA = new SubredditCRDTDoc('peer-A', 'Initial Title');
    const peerB = new SubredditCRDTDoc('peer-B', 'Initial Title');
    const peerC = new SubredditCRDTDoc('peer-C', 'Initial Title');

    // Concurrent independent edits while offline
    peerA.setTitle('Title set by Peer A', 100);
    peerA.addModerator('mod-alpha', 100);

    peerB.setRules('Rule 1: Be kind\nRule 2: No spam', 200);
    peerB.addModerator('mod-beta', 200);

    peerC.setSidebar('P2P sovereign mesh community description', 300);
    peerC.addModerator('mod-gamma', 300);

    // Peer B removes mod-alpha at timestamp 150
    peerB.removeModerator('mod-alpha', 150);

    // Export states
    const stateA = peerA.exportState();
    const stateB = peerB.exportState();
    const stateC = peerC.exportState();

    // Node A merges B then C
    peerA.merge(stateB);
    peerA.merge(stateC);

    // Node B merges C then A
    peerB.merge(stateC);
    peerB.merge(stateA);

    // Node C merges A then B
    peerC.merge(stateA);
    peerC.merge(stateB);

    // Assert absolute convergence across all 3 nodes
    expect(peerA.getTitle()).toEqual(peerB.getTitle());
    expect(peerB.getTitle()).toEqual(peerC.getTitle());

    expect(peerA.getRules()).toEqual(peerB.getRules());
    expect(peerB.getRules()).toEqual(peerC.getRules());

    expect(peerA.getSidebar()).toEqual(peerB.getSidebar());
    expect(peerB.getSidebar()).toEqual(peerC.getSidebar());

    expect(peerA.getActiveModerators().sort()).toEqual(peerB.getActiveModerators().sort());
    expect(peerB.getActiveModerators().sort()).toEqual(peerC.getActiveModerators().sort());

    // Deterministic convergence values check
    expect(peerA.getTitle()).toBe('Title set by Peer A');
    expect(peerA.getRules()).toBe('Rule 1: Be kind\nRule 2: No spam');
    expect(peerA.getSidebar()).toBe('P2P sovereign mesh community description');
    expect(peerA.getActiveModerators()).not.toContain('mod-alpha');
    expect(peerA.getActiveModerators()).toContain('mod-beta');
    expect(peerA.getActiveModerators()).toContain('mod-gamma');
  });

  it('handles concurrent identical-timestamp edits deterministically via peerId tie-break', () => {
    const peer1 = new SubredditCRDTDoc('peer-01');
    const peer2 = new SubredditCRDTDoc('peer-02');

    peer1.setTitle('Title from peer 01', 500);
    peer2.setTitle('Title from peer 02', 500);

    peer1.merge(peer2.exportState());
    peer2.merge(peer1.exportState());

    expect(peer1.getTitle()).toBe('Title from peer 02');
    expect(peer2.getTitle()).toBe('Title from peer 02');
  });
});
