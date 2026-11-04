import { describe, it, expect } from 'vitest';
import { SubredditCRDTDoc } from './crdt';

describe('SubredditCRDTDoc', () => {
  it('should initialize with peer creator as active moderator', () => {
    const doc = new SubredditCRDTDoc('peerA', 'Cyberpunk Subreddit');
    expect(doc.getTitle()).toBe('Cyberpunk Subreddit');
    expect(doc.getRules()).toBe('');
    expect(doc.getActiveModerators()).toEqual(['peerA']);
  });

  it('should update field when timestamp is higher', () => {
    const doc = new SubredditCRDTDoc('peerA', 'Initial Title');
    const t1 = 1000;
    const t2 = 2000;

    doc.setTitle('New Title', t2);
    expect(doc.getTitle()).toBe('New Title');

    // Attempt to overwrite with older timestamp
    doc.setTitle('Old Title', t1);
    expect(doc.getTitle()).toBe('New Title');
  });

  it('should break ties deterministically using peerId when timestamps match', () => {
    const docA = new SubredditCRDTDoc('peerA');
    const docZ = new SubredditCRDTDoc('peerZ');

    const commonTime = 5000;
    docA.setTitle('Title from A', commonTime);
    docZ.setTitle('Title from Z', commonTime);

    // Merge docZ into docA: since 'peerZ' > 'peerA', Title from Z must win
    docA.merge(docZ.exportState());
    expect(docA.getTitle()).toBe('Title from Z');

    // Commutativity: Merge docA into docZ
    docZ.merge(docA.exportState());
    expect(docZ.getTitle()).toBe('Title from Z');
  });

  it('should correctly handle moderator addition and tombstone removal', () => {
    const doc = new SubredditCRDTDoc('peerA');
    doc.addModerator('peerB', 1000);
    expect(doc.getActiveModerators().sort()).toEqual(['peerA', 'peerB'].sort());

    // Remove peerB at timestamp 2000
    doc.removeModerator('peerB', 2000);
    expect(doc.getActiveModerators()).toEqual(['peerA']);

    // Attempt older re-addition should not resurrect
    doc.addModerator('peerB', 1500);
    expect(doc.getActiveModerators()).toEqual(['peerA']);

    // Newer re-addition should resurrect
    doc.addModerator('peerB', 3000);
    expect(doc.getActiveModerators().sort()).toEqual(['peerA', 'peerB'].sort());
  });

  it('should converge deterministically across multiple replicas (CvRDT properties)', () => {
    const replica1 = new SubredditCRDTDoc('node1', 'Original');
    const replica2 = new SubredditCRDTDoc('node2', 'Original');
    const replica3 = new SubredditCRDTDoc('node3', 'Original');

    // Concurrent independent edits
    replica1.setTitle('Updated by Node 1', 100);
    replica1.setRules('Be respectful', 150);

    replica2.setTitle('Updated by Node 2', 200); // newer title
    replica2.setSidebar('Welcome to the mesh', 120);

    replica3.addModerator('alice', 180);

    // Replicate across network in arbitrary order
    replica1.merge(replica2.exportState());
    replica1.merge(replica3.exportState());

    replica3.merge(replica1.exportState());
    replica2.merge(replica3.exportState());

    // All replicas must converge to identical state
    expect(replica1.getTitle()).toBe('Updated by Node 2');
    expect(replica2.getTitle()).toBe('Updated by Node 2');
    expect(replica3.getTitle()).toBe('Updated by Node 2');

    expect(replica1.getRules()).toBe('Be respectful');
    expect(replica2.getRules()).toBe('Be respectful');
    expect(replica3.getRules()).toBe('Be respectful');

    expect(replica1.getSidebar()).toBe('Welcome to the mesh');
    expect(replica2.getSidebar()).toBe('Welcome to the mesh');
    expect(replica3.getSidebar()).toBe('Welcome to the mesh');

    expect(replica1.getActiveModerators().sort()).toEqual(['alice', 'node1', 'node2', 'node3'].sort());
    expect(replica2.getActiveModerators().sort()).toEqual(['alice', 'node1', 'node2', 'node3'].sort());
    expect(replica3.getActiveModerators().sort()).toEqual(['alice', 'node1', 'node2', 'node3'].sort());
  });

  it('should serialize and deserialize state faithfully', () => {
    const doc = new SubredditCRDTDoc('nodeX', 'Mesh Wiki');
    doc.setRules('Rule 1: Decentralize everything');
    doc.setSidebar('Contact: DHT:xyz');

    const json = doc.serialize();
    const restored = SubredditCRDTDoc.deserialize('nodeY', json);

    expect(restored.getTitle()).toBe('Mesh Wiki');
    expect(restored.getRules()).toBe('Rule 1: Decentralize everything');
    expect(restored.getSidebar()).toBe('Contact: DHT:xyz');
  });
});
