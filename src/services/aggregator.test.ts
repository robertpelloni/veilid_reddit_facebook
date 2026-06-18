import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeedAggregator } from './aggregator';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('FeedAggregator', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should initialize with empty subscribed keys if localStorage is empty', () => {
    const aggregator = new FeedAggregator();
    expect((aggregator as any).subscribedKeys).toEqual([]);
  });

  it('should initialize with keys from localStorage', () => {
    window.localStorage.setItem('subscribed_keys', JSON.stringify(['key1', 'key2']));
    const aggregator = new FeedAggregator();
    expect((aggregator as any).subscribedKeys).toEqual(['key1', 'key2']);
  });

  it('should add new key to subscribed keys and save to localStorage', () => {
    const aggregator = new FeedAggregator();
    aggregator.subscribe('newKey');

    expect((aggregator as any).subscribedKeys).toContain('newKey');
    expect(window.localStorage.getItem('subscribed_keys')).toBe(JSON.stringify(['newKey']));
  });

  it('should not add duplicate keys', () => {
    const aggregator = new FeedAggregator();
    aggregator.subscribe('key1');
    aggregator.subscribe('key1');

    expect((aggregator as any).subscribedKeys.length).toBe(1);
    expect(window.localStorage.getItem('subscribed_keys')).toBe(JSON.stringify(['key1']));
  });

  it('should fetch and aggregate feeds correctly', async () => {
    const aggregator = new FeedAggregator();
    aggregator.subscribe('key1');
    aggregator.subscribe('key2');

    const mockPost1 = { post_id: '1', author_id: 'a', title: 'Test 1', target_key: 'tk1', timestamp: '2026-06-05T10:00:00Z' };
    const mockPost2 = { post_id: '2', author_id: 'b', title: 'Test 2', target_key: 'tk2', timestamp: '2026-06-05T11:00:00Z' };

    global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('key1')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([mockPost1])
            });
        }
        if (url.includes('key2')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve([mockPost2])
            });
        }
        return Promise.resolve({ ok: false });
    }) as any;

    const feeds = await aggregator.fetchFeed();

    // Should return sorted by timestamp descending
    expect(feeds).toEqual([mockPost2, mockPost1]);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle fetch failures gracefully', async () => {
      const aggregator = new FeedAggregator();
      aggregator.subscribe('key1');

      global.fetch = vi.fn().mockImplementation(() => Promise.reject('Network error'));

      const feeds = await aggregator.fetchFeed();
      expect(feeds).toEqual([]);
  });
});
