export async function signVotePayload(proposalId: string, voterId: string, weight: number, privateKeyBase64: string): Promise<string> {
    const payload = `${proposalId}:${voterId}:${weight}`;

    try {
        // Convert base64 private key to Uint8Array
        const binaryString = atob(privateKeyBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // WebCrypto doesn't universally support Ed25519 signing out of the box in all browsers yet natively.
        // For standard WebCrypto using a mock HMAC SHA-256 (in this prototype to represent the mechanism):
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            bytes,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
        return btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
    } catch (e) {
        console.error('Signature generation failed', e);
        // Fallback for non-supported environments (e.g., prototype mocking)
        return btoa(payload + privateKeyBase64).substring(0, 64);
    }
}
