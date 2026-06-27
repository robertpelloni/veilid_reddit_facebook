export async function uploadEncryptedMedia(file: File): Promise<{ cid: string; key: string }> {
    const buffer = await file.arrayBuffer();

    const response = await fetch('http://127.0.0.1:1337/media/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
        body: buffer
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return { cid: result.cid, key: result.key };
}

export function getDecryptedMediaUrl(cid: string, key: string): string {
    return `http://127.0.0.1:1337/media/download?cid=${encodeURIComponent(cid)}&key=${encodeURIComponent(key)}`;
}
