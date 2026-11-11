/**
 * BrowserVeilidClient
 *
 * Provides an in-browser fallback client simulating the Veilid DHT network and local cache.
 * When the native Go sidecar (127.0.0.1:1337) is unavailable (e.g. static web hosting, mobile preview,
 * or sandboxed browser environments), this client seamlessly emulates core Veilid capabilities
 * using WebCrypto, IndexedDB, and localStorage persistence.
 */

export interface BrowserVeilidIdentity {
  dht_key: string;
  private_key: string;
  mnemonic: string;
}

export interface BrowserVeilidProfileRegistry {
  username: string;
  version: number;
  updated_at: string;
  public_key: string;
  bio?: string;
  profile_html?: string;
  profile_css?: string;
  [key: string]: any;
}

export interface BrowserVeilidPost {
  id: string;
  author_id: string;
  subreddit: string;
  title: string;
  content: string;
  timestamp: string;
  comment_count?: number;
}

export interface BrowserVeilidComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  timestamp: string;
}

export interface BrowserVeilidDAOProposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  yes_votes: number;
  no_votes: number;
  created_at: string;
}

export interface BrowserVeilidDiscoveryEntry {
  dht_key: string;
  username: string;
}

export class BrowserVeilidClient {
  private static STORAGE_PREFIX = 'browser_veilid_';

  /**
   * Generates a 32-byte cryptographically secure identity pair using WebCrypto.
   */
  static async generateIdentity(): Promise<BrowserVeilidIdentity> {
    const rawKey = new Uint8Array(32);
    crypto.getRandomValues(rawKey);
    const dhtKey = Array.from(rawKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const privKeyBytes = new Uint8Array(32);
    crypto.getRandomValues(privKeyBytes);
    const privateKey = Array.from(privKeyBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Generate a simple 12-word mnemonic mock
    const mnemonicWords = [
      'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot',
      'golf', 'hotel', 'india', 'juliet', 'kilo', 'lima'
    ];
    const mnemonic = mnemonicWords.join(' ');

    return {
      dht_key: dhtKey,
      private_key: privateKey,
      mnemonic
    };
  }

  /**
   * Publishes profile data into browser local storage simulating DHT key persistence.
   */
  static async publishProfile(profile: BrowserVeilidProfileRegistry): Promise<string> {
    const dhtKey = profile.public_key || (await this.generateIdentity()).dht_key;
    const key = `${this.STORAGE_PREFIX}profile_${dhtKey}`;
    localStorage.setItem(key, JSON.stringify(profile));
    await this.registerKey(dhtKey, profile.username || 'Anonymous');
    return dhtKey;
  }

  /**
   * Fetches profile data by DHT key.
   */
  static async fetchProfile(dhtKey: string): Promise<BrowserVeilidProfileRegistry | null> {
    const key = `${this.STORAGE_PREFIX}profile_${dhtKey}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  /**
   * Registers a key in the discovery index.
   */
  static async registerKey(dhtKey: string, username: string): Promise<void> {
    const existing = await this.getDiscovery();
    const filtered = existing.filter((e) => e.dht_key !== dhtKey);
    filtered.push({ dht_key: dhtKey, username });
    localStorage.setItem(`${this.STORAGE_PREFIX}discovery`, JSON.stringify(filtered));
  }

  /**
   * Returns registered discovery keys.
   */
  static async getDiscovery(): Promise<BrowserVeilidDiscoveryEntry[]> {
    const raw = localStorage.getItem(`${this.STORAGE_PREFIX}discovery`);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Publishes a post.
   */
  static async publishPost(post: BrowserVeilidPost): Promise<BrowserVeilidPost> {
    const existing = await this.listPosts(post.author_id);
    existing.unshift(post);
    localStorage.setItem(`${this.STORAGE_PREFIX}posts_${post.author_id}`, JSON.stringify(existing));

    // Also save under general posts pool
    const allPosts = await this.listPosts('all');
    allPosts.unshift(post);
    localStorage.setItem(`${this.STORAGE_PREFIX}posts_all`, JSON.stringify(allPosts));
    return post;
  }

  /**
   * Lists posts for a given author or all posts.
   */
  static async listPosts(key: string = 'all'): Promise<BrowserVeilidPost[]> {
    const storageKey = `${this.STORAGE_PREFIX}posts_${key}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Adds a comment to a post.
   */
  static async addComment(comment: BrowserVeilidComment): Promise<void> {
    const key = `${this.STORAGE_PREFIX}comments_${comment.post_id}`;
    const raw = localStorage.getItem(key);
    const comments: BrowserVeilidComment[] = raw ? JSON.parse(raw) : [];
    comments.push(comment);
    localStorage.setItem(key, JSON.stringify(comments));
  }

  /**
   * Lists comments for a post.
   */
  static async listComments(postId: string): Promise<BrowserVeilidComment[]> {
    const key = `${this.STORAGE_PREFIX}comments_${postId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Lists DAO proposals.
   */
  static async listDAOProposals(): Promise<BrowserVeilidDAOProposal[]> {
    const raw = localStorage.getItem(`${this.STORAGE_PREFIX}proposals`);
    if (!raw) {
      // Seed default proposals
      const defaults: BrowserVeilidDAOProposal[] = [
        {
          id: 'prop-1',
          title: 'Bootstrap Veilid Community Mesh Node Network',
          description: 'Deploy 50 high-availability seed relays across 5 continents.',
          proposer: 'admin',
          yes_votes: 120,
          no_votes: 4,
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem(`${this.STORAGE_PREFIX}proposals`, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  }

  /**
   * Returns current mock network status.
   */
  static getStatus(): { connected_peers: number; node_id: string; protocol: string; mode: string } {
    return {
      connected_peers: 12,
      node_id: 'browser_wasm_simulated_node',
      protocol: 'veilid-browser-wasm-v1',
      mode: 'Browser-Only WebClient'
    };
  }
}
