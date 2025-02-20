export declare function generateCodeVerifier(length?: number): string;
export declare function generateCodeChallenge(verifier: string): Promise<string>;
export declare function generateState(): string;
