import { describe, it, expect, beforeEach } from 'vitest';
import { BrowserVeilidClient } from './browser_veilid';

describe('BrowserVeilidClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates cryptographic identity with 32-byte hex keys and mnemonic', async () => {
    const id = await BrowserVeilidClient.generateIdentity();
    expect(id).toBeDefined();
    expect(id.dht_key).toHaveLength(64);
    expect(id.private_key).toHaveLength(64);
    expect(id.mnemonic.split(' ')).toHaveLength(12);
  });

  it('publishes and fetches profiles from local simulated DHT storage', async () => {
    const profile = {
      username: 'AliceInWonderland',
      version: 1,
      updated_at: new Date().toISOString(),
      public_key: 'aabbcc112233',
      bio: 'Decentralized explorer'
    };

    const dhtKey = await BrowserVeilidClient.publishProfile(profile);
    expect(dhtKey).toBe('aabbcc112233');

    const fetched = await BrowserVeilidClient.fetchProfile(dhtKey);
    expect(fetched).not.toBeNull();
    expect(fetched?.username).toBe('AliceInWonderland');
    expect(fetched?.bio).toBe('Decentralized explorer');
  });

  it('registers keys and lists discovery entries', async () => {
    await BrowserVeilidClient.registerKey('key_123', 'Alice');
    await BrowserVeilidClient.registerKey('key_456', 'Bob');

    const discovery = await BrowserVeilidClient.getDiscovery();
    expect(discovery).toHaveLength(2);
    expect(discovery.map(d => d.username)).toContain('Alice');
    expect(discovery.map(d => d.username)).toContain('Bob');
  });

  it('publishes and lists posts in local store', async () => {
    const post = {
      id: 'post_1',
      author_id: 'alice_key',
      subreddit: 'r/rust',
      title: 'Tauri v2 Migration',
      content: 'Seamless desktop & mobile experience',
      timestamp: new Date().toISOString()
    };

    await BrowserVeilidClient.publishPost(post);
    const authorPosts = await BrowserVeilidClient.listPosts('alice_key');
    expect(authorPosts).toHaveLength(1);
    expect(authorPosts[0].title).toBe('Tauri v2 Migration');

    const allPosts = await BrowserVeilidClient.listPosts('all');
    expect(allPosts).toHaveLength(1);
    expect(allPosts[0].id).toBe('post_1');
  });

  it('adds and retrieves comments', async () => {
    const comment = {
      id: 'comment_1',
      post_id: 'post_1',
      author_id: 'bob_key',
      content: 'Incredible work on the sidecar matrix!',
      timestamp: new Date().toISOString()
    };

    await BrowserVeilidClient.addComment(comment);
    const comments = await BrowserVeilidClient.listComments('post_1');
    expect(comments).toHaveLength(1);
    expect(comments[0].content).toContain('Incredible work');
  });

  it('provides default DAO proposals', async () => {
    const proposals = await BrowserVeilidClient.listDAOProposals();
    expect(proposals.length).toBeGreaterThan(0);
    expect(proposals[0].title).toContain('Veilid Community');
  });

  it('returns valid status object', () => {
    const status = BrowserVeilidClient.getStatus();
    expect(status.mode).toContain('Browser-Only');
    expect(status.connected_peers).toBeGreaterThan(0);
  });
});
