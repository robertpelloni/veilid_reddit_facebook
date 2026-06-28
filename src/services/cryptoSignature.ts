export async function signVotePayload(proposalId: string, voterId: string, weight: number, privateKeyBase64: string): Promise<string> {
  // In a real application, we would use ED25519 for Veilid identities.
  // However, Web Crypto API does not natively support ED25519 in all browsers yet (or it requires a polyfill).
  // For the purpose of the prototype, we generate a mock signature using SHA-256 HMAC or a simple hash,
  // representing the cryptographic signature.

  const encoder = new TextEncoder();
  const payload = `${proposalId}:${voterId}:${weight}`;

  try {
    // Basic HMAC SHA-256 for mock signature using the private key as the secret
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(privateKeyBase64),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  } catch (e) {
    console.error('Signature generation failed', e);
    // Fallback simple base64 mock
    return btoa(payload + privateKeyBase64).substring(0, 64);
  }
}
