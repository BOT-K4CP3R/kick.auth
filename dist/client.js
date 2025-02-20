"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KickAuthClient = void 0;
const utils_1 = require("./utils");
class KickAuthClient {
    constructor(config) {
        this.config = config;
        this.baseUrl = 'https://id.kick.com';
        this.codeVerifier = null;
        this.config.scopes = config.scopes || ['user:read'];
    }
    async getAuthorizationUrl() {
        const state = (0, utils_1.generateState)();
        this.codeVerifier = (0, utils_1.generateCodeVerifier)();
        const codeChallenge = await (0, utils_1.generateCodeChallenge)(this.codeVerifier);
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: 'code',
            redirect_uri: this.config.redirectUri,
            state,
            scope: this.config.scopes.join(' '),
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });
        return {
            url: `${this.baseUrl}/oauth/authorize?${params.toString()}`,
            state,
            codeVerifier: this.codeVerifier
        };
    }
    async getAccessToken(code, codeVerifier) {
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
    async refreshToken(refreshToken) {
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
    async revokeToken(token, tokenHintType) {
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
exports.KickAuthClient = KickAuthClient;
//# sourceMappingURL=client.js.map