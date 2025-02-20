import { KickAuthConfig, TokenResponse, TokenHintType } from './types';
export declare class KickAuthClient {
    private config;
    private readonly baseUrl;
    private codeVerifier;
    constructor(config: KickAuthConfig);
    getAuthorizationUrl(): Promise<{
        url: string;
        state: string;
        codeVerifier: string;
    }>;
    getAccessToken(code: string, codeVerifier: string): Promise<TokenResponse>;
    refreshToken(refreshToken: string): Promise<TokenResponse>;
    revokeToken(token: string, tokenHintType?: TokenHintType): Promise<void>;
}
