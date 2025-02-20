export interface TokenResponse {
    access_token: string;
    token_type: string;
    refresh_token: string;
    expiry: string;
    scope: string;
}

export interface KickAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes?: string[];
}

export type TokenHintType = 'access_token' | 'refresh_token';

export interface AuthorizeParams {
    state: string;
    codeChallenge: string;
    codeChallengeMethod: 'S256';
    scopes: string[];
}
