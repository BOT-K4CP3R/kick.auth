import { KickAuthConfig, TokenResponse, TokenHintType, AuthorizeParams } from './types';
import { generateCodeChallenge, generateCodeVerifier, generateState } from './utils';

export class KickAuthClient {
    private readonly baseUrl = 'https://id.kick.com';
    private codeVerifier: string | null = null;
    
    constructor(private config: KickAuthConfig) {
        this.config.scopes = config.scopes || ['user:read'];
    }

    async getAuthorizationUrl(): Promise<{ url: string; state: string; codeVerifier: string }> {
        const state = generateState();
        this.codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(this.codeVerifier);

        const params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: 'code',
            redirect_uri: this.config.redirectUri,
            state,
            scope: this.config.scopes!.join(' '),
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });

        return {
            url: `${this.baseUrl}/oauth/authorize?${params.toString()}`,
            state,
            codeVerifier: this.codeVerifier
        };
    }

    async getAccessToken(code: string, codeVerifier: string): Promise<TokenResponse> {
        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                redirect_uri: this.config.redirectUri,
                code_verifier: codeVerifier,
                code
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        const response = await fetch(`${this.baseUrl}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                refresh_token: refreshToken
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    async revokeToken(token: string, tokenHintType?: TokenHintType): Promise<void> {
        const params = new URLSearchParams({ token });
        if (tokenHintType) {
            params.append('token_hint_type', tokenHintType);
        }

        const response = await fetch(`${this.baseUrl}/oauth/revoke?${params.toString()}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }
}
