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
    // Iterate through each subscribed user's key to fetch their actual posts from the sidecar.

    for (const key of this.subscribedKeys) {
        try {
            const postsResp = await fetch(`${this.baseUrl}/posts/list?key=${key}`);
            if (!postsResp.ok) continue;
            const userPosts = await postsResp.json();

            if (Array.isArray(userPosts)) {
                allPosts.push(...userPosts);
            }
        } catch (e) {
            console.error(`Failed to aggregate posts from key ${key}:`, e);
        }
    }

    // Sort by timestamp descending
    return allPosts.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
