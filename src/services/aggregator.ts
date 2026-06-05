interface PostHeader {
  post_id: string;
  author_id: string;
  title: string;
  target_key: string;
  timestamp: string;
}

export class FeedAggregator {
  private subscribedKeys: string[] = [];

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
    // In a production P2P network, we iterate through each subscribed user's
    // subreddit_index key on Veilid DHT, pull their recent PostHeaders,
    // and blend them into a single chronological timeline.

    for (const key of this.subscribedKeys) {
        try {
            // Fetch the profile first to get the subreddit_index
            const profileResp = await fetch(`http://127.0.0.1:1337/fetch?key=${key}`);
            if (!profileResp.ok) continue;
            const profile = await profileResp.json();

            // For the prototype, we assume the sidecar provides
            // the PostHeader array directly via the profile metadata
            // or a dedicated /posts endpoint.
            // Here we mock the result of a successful DHT crawl:
            const userPosts: PostHeader[] = [
                {
                    post_id: `id_${key}_1`,
                    author_id: key,
                    title: `Sovereign Post from ${profile.username}`,
                    target_key: `target_${key}`,
                    timestamp: new Date(Date.now() - Math.random() * 10000000).toISOString()
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
