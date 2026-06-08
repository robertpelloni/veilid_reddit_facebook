import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedAggregator } from '../services/aggregator';

describe('FeedAggregator', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty subscribed keys', () => {
    const aggregator = new FeedAggregator();
    expect((aggregator as any).subscribedKeys).toEqual([]);
  });

  it('should allow subscribing to new keys', () => {
    const aggregator = new FeedAggregator();
    aggregator.subscribe('test-key-1');
    expect((aggregator as any).subscribedKeys).toContain('test-key-1');
    expect(localStorage.getItem('subscribed_keys')).toBe(JSON.stringify(['test-key-1']));
  });

  it('should not subscribe to duplicate keys', () => {
    const aggregator = new FeedAggregator();
    aggregator.subscribe('test-key-1');
    aggregator.subscribe('test-key-1');
    expect((aggregator as any).subscribedKeys).toHaveLength(1);
  });

  it('should fetch and aggregate posts from multiple keys', async () => {
    const aggregator = new FeedAggregator();
    aggregator.subscribe('key1');
    aggregator.subscribe('key2');

    const mockPosts1 = [
      { post_id: '1', author_id: 'key1', title: 'Post 1', timestamp: new Date(1000).toISOString() }
    ];
    const mockPosts2 = [
      { post_id: '2', author_id: 'key2', title: 'Post 2', timestamp: new Date(2000).toISOString() }
    ];

    global.fetch = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts1)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts2)
      }));

    const feed = await aggregator.fetchFeed();

    expect(feed).toHaveLength(2);
    // Should be sorted by timestamp descending
    expect(feed[0].post_id).toBe('2');
    expect(feed[1].post_id).toBe('1');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle fetch failures gracefully', async () => {
    const aggregator = new FeedAggregator();
    aggregator.subscribe('key1');

    global.fetch = vi.fn().mockImplementationOnce(() => Promise.reject('Network error'));

    const feed = await aggregator.fetchFeed();
    expect(feed).toEqual([]);
  });
});
