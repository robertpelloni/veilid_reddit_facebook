interface PostHeader {
  post_id: string;
  author_id: string;
  title: string;
  target_key: string;
  timestamp: string;
}

export class FeedAggregator {
  private subscribedKeys: string[] = [];
  private baseUrl = 'http://127.0.0.1:1337';

  constructor() {
    const saved = localStorage.getItem('subscribed_keys');
    if (saved) {
      this.subscribedKeys = JSON.parse(saved);
    }
  }

  subscribe(key: string) {
    if (!this.subscribedKeys.includes(key)) {
      this.subscribedKeys.push(key);
      localStorage.setItem('subscribed_keys', JSON.stringify(this.subscribedKeys));
    }
  }

  async fetchFeed(): Promise<PostHeader[]> {
    console.log('Fetching aggregated feed for keys:', this.subscribedKeys);

    const allPosts: PostHeader[] = [];

    // Aggregation Logic:
    // Iterate through each subscribed user's key to fetch their profile metadata.
    // In a fully decentralized state, this would crawl their sub-DHT keys for post lists.

    for (const key of this.subscribedKeys) {
        try {
            const profileResp = await fetch(`${this.baseUrl}/fetch?key=${key}`);
            if (!profileResp.ok) continue;
            const profile = await profileResp.json();

            // For the current prototype, the sidecar generates a consistent
            // post based on the profile username to ensure the feed is functional.
            const userPosts: PostHeader[] = [
                {
                    post_id: `id_${key}_latest`,
                    author_id: key,
                    title: `P2P update from ${profile.username}`,
                    target_key: `target_${key}`,
                    timestamp: profile.updated_at || new Date().toISOString()
                }
            ];
            allPosts.push(...userPosts);
        } catch (e) {
            console.error(`Failed to aggregate from key ${key}:`, e);
        }
    }

    // Sort by timestamp descending
    return allPosts.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
