import * as crypto from 'crypto';

export function generateCodeVerifier(length: number = 128): string {
    return crypto.randomBytes(length)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
        .slice(0, length);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
    const hash = crypto.createHash('sha256')
        .update(verifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    return hash;
}

export function generateState(): string {
    return crypto.randomBytes(32).toString('hex');
}
