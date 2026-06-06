import { invoke } from '@tauri-apps/api/tauri';

export interface SovereignIdentity {
  username: string;
  dht_key: string;
  private_key: string; // ED25519
  mnemonic: string;
}

const IDENTITY_KEY = 'veilid_sovereign_identity_v1';

export class IdentityVault {
  /**
   * Generates a new sovereign identity.
   * In a real Veilid app, this would call into the core to generate a Crypto Routing Pair.
   */
  static async generate(username: string): Promise<SovereignIdentity> {
    // Superior Intelligence: Offload key generation to the secure Go sidecar
    // Using Go's crypto/rand ensures industrial-grade entropy.
    const response = await fetch('http://127.0.0.1:1337/identity/generate', { method: 'POST' });
    if (!response.ok) throw new Error("Secure generation failed");
    const data = await response.json();

    const identity: SovereignIdentity = {
      username,
      dht_key: data.dht_key,
      private_key: data.private_key,
      mnemonic: data.mnemonic
    };

    this.save(identity);
    return identity;
  }

  static save(identity: SovereignIdentity): void {
    // For "Stealth" UX, we could encrypt this with a session pin, but for now we persist.
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  }

  static get(): SovereignIdentity | null {
    const data = localStorage.getItem(IDENTITY_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(IDENTITY_KEY);
  }

  static async exportToBinary(): Promise<string> {
    const identity = this.get();
    if (!identity) throw new Error("No identity found");

    // In a real scenario, we'd send this to the Go sidecar to create a binary backup file.
    return JSON.stringify(identity, null, 2);
  }
}
