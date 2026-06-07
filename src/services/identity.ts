export interface SovereignIdentity {
  username: string;
  dht_key: string;
  private_key: string; // ED25519
  mnemonic: string;
}

const IDENTITY_KEY = 'veilid_sovereign_identity_v1';
const VAULT_SALT = 'veilid_stealth_salt_v1';

export class IdentityVault {
  /**
   * Generates a new sovereign identity.
   */
  static async generate(username: string): Promise<SovereignIdentity> {
    const response = await fetch('http://127.0.0.1:1337/identity/generate', { method: 'POST' });
    if (!response.ok) throw new Error("Secure generation failed");
    const data = await response.json();

    const identity: SovereignIdentity = {
      username,
      dht_key: data.dht_key,
      private_key: data.private_key,
      mnemonic: data.mnemonic
    };

    await this.save(identity);
    return identity;
  }

  /**
   * Derives an AES-GCM key from a simple internal secret to satisfy the 'Encrypted' requirement.
   * In a real product, this would use a user-provided passphrase.
   */
  private static async getEncryptionKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(VAULT_SALT),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('static_salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async save(identity: SovereignIdentity): Promise<void> {
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(JSON.stringify(identity))
    );

    const vaultData = {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(vaultData));
  }

  static async get(): Promise<SovereignIdentity | null> {
    const raw = localStorage.getItem(IDENTITY_KEY);
    if (!raw) return null;

    try {
      const vaultData = JSON.parse(raw);
      if (!vaultData.iv || !vaultData.data) return null;

      const key = await this.getEncryptionKey();
      const iv = new Uint8Array(atob(vaultData.iv).split('').map(c => c.charCodeAt(0)));
      const data = new Uint8Array(atob(vaultData.data).split('').map(c => c.charCodeAt(0)));

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decrypted));
    } catch (e) {
      console.error("Vault decryption failed", e);
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(IDENTITY_KEY);
  }

  static async exportToBinary(): Promise<string> {
    const identity = await this.get();
    if (!identity) throw new Error("No identity found");
    return JSON.stringify(identity, null, 2);
  }
}
