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
    // Load from local storage or SQLite cache
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
    // In a real app, this would call the Go sidecar to fetch from Veilid
    console.log('Fetching feed for keys:', this.subscribedKeys);

    // Mocking feed data
    return [
      {
        post_id: '1',
        author_id: 'alice_key',
        title: 'Hello from Alice',
        target_key: 'alice_post_1',
        timestamp: new Date().toISOString()
      },
      {
        post_id: '2',
        author_id: 'bob_key',
        title: 'Bobs updates',
        target_key: 'bob_post_1',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
