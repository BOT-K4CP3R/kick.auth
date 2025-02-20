# Kick Auth Library

[![NPM Version](https://img.shields.io/npm/v/kick-auth)](https://www.npmjs.com/package/kick-auth)
[![License](https://img.shields.io/npm/l/kick-auth)](https://github.com/yourusername/kick-auth/blob/main/LICENSE)

A TypeScript/JavaScript library for implementing Kick.com OAuth 2.1 authentication in Node.js applications.

## 📋 Table of Contents
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Available Scopes](#-available-scopes)
- [Error Handling](#-error-handling)
- [Examples](#-examples)
- [TypeScript Support](#-typescript-support)

## 📥 Installation

```bash
npm install kick-auth
# or
yarn add kick-auth
# or
pnpm add kick-auth
```

## 🚀 Quick Start

### 1. Installation
```bash
npm install kick-auth
```

### 2. Basic Setup
```typescript
import { KickAuthClient } from 'kick-auth';
import express from 'express';
import session from 'express-session';

// Initialize Express
const app = express();

// Set up session middleware
app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false
}));

// Create Kick Auth client
const kickAuth = new KickAuthClient({
    clientId: process.env.KICK_CLIENT_ID!,
    clientSecret: process.env.KICK_CLIENT_SECRET!,
    redirectUri: 'http://localhost:3000/auth/callback',
    scopes: ['user:read', 'channel:read']
});
```

### 3. Implement Auth Routes
```typescript
// Login route
app.get('/auth/login', async (req, res) => {
    try {
        // Generate authorization URL with PKCE
        const { url, state, codeVerifier } = await kickAuth.getAuthorizationUrl();
        
        // Store state and codeVerifier in session
        req.session.state = state;
        req.session.codeVerifier = codeVerifier;
        
        // Redirect to Kick login
        res.redirect(url);
    } catch (error) {
        res.status(500).send('Failed to initialize auth flow');
    }
});

// Callback route
app.get('/auth/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        
        // Verify state parameter
        if (state !== req.session.state) {
            return res.status(400).send('Invalid state parameter');
        }
        
        // Exchange code for tokens
        const tokens = await kickAuth.getAccessToken(
            code as string,
            req.session.codeVerifier!
        );
        
        // Store tokens securely
        req.session.accessToken = tokens.access_token;
        req.session.refreshToken = tokens.refresh_token;
        
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send('Authentication failed');
    }
});

// Protected route example
app.get('/dashboard', (req, res) => {
    if (!req.session.accessToken) {
        return res.redirect('/auth/login');
    }
    res.send('Authenticated!');
});

// Logout route
app.get('/auth/logout', async (req, res) => {
    try {
        // Revoke token if it exists
        if (req.session.accessToken) {
            await kickAuth.revokeToken(req.session.accessToken);
        }
        
        // Clear session
        req.session.destroy(() => {
            res.redirect('/');
        });
    } catch (error) {
        res.status(500).send('Logout failed');
    }
});
```

### 4. Token Refresh Example
```typescript
// Middleware to check token expiration
async function refreshTokenMiddleware(req, res, next) {
    try {
        if (!req.session.refreshToken) {
            return res.redirect('/auth/login');
        }

        // Check if token needs refresh (implement your own logic)
        if (tokenNeedsRefresh()) {
            const tokens = await kickAuth.refreshToken(req.session.refreshToken);
            
            // Update tokens in session
            req.session.accessToken = tokens.access_token;
            req.session.refreshToken = tokens.refresh_token;
        }
        
        next();
    } catch (error) {
        // If refresh fails, redirect to login
        req.session.destroy(() => {
            res.redirect('/auth/login');
        });
    }
}

// Use middleware on protected routes
app.get('/dashboard', refreshTokenMiddleware, (req, res) => {
    res.send('Dashboard with fresh token!');
});
```

### 5. Complete Example
```typescript
import { KickAuthClient } from 'kick-auth';
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Kick Auth
const kickAuth = new KickAuthClient({
    clientId: process.env.KICK_CLIENT_ID!,
    clientSecret: process.env.KICK_CLIENT_SECRET!,
    redirectUri: process.env.KICK_REDIRECT_URI!,
    scopes: ['user:read', 'channel:read']
});

// Implement routes
// ... (use the route examples from above) ...

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### 6. Environment Variables (.env)
```env
KICK_CLIENT_ID=your_client_id
KICK_CLIENT_SECRET=your_client_secret
KICK_REDIRECT_URI=http://localhost:3000/auth/callback
SESSION_SECRET=your_session_secret
PORT=3000
```

## 🎯 Available Scopes

| Scope | Description |
|-------|-------------|
| `user:read` | Read user information |
| `channel:read` | Read channel information |
| `channel:write` | Update channel information |
| `chat:write` | Send chat messages |
| `streamkey:read` | Read stream key |
| `events:subscribe` | Subscribe to channel events |

### 🔧 KickAuthClient

#### Constructor
```typescript
const client = new KickAuthClient({
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    scopes?: string[]
});
```

#### Methods

##### 🔗 getAuthorizationUrl()
```typescript
async getAuthorizationUrl(): Promise<{
    url: string;
    state: string;
    codeVerifier: string;
}>;
```

##### 🎫 getAccessToken()
```typescript
async getAccessToken(
    code: string,
    codeVerifier: string
): Promise<TokenResponse>;
```

##### 🔄 refreshToken()
```typescript
async refreshToken(
    refreshToken: string
): Promise<TokenResponse>;
```

##### ❌ revokeToken()
```typescript
async revokeToken(
    token: string,
    tokenHintType?: 'access_token' | 'refresh_token'
): Promise<void>;
```

## ⚠️ Error Handling

```typescript
try {
    const tokens = await client.getAccessToken(code, codeVerifier);
} catch (error) {
    if (error.message.includes('invalid_grant')) {
        console.error('Invalid code or code verifier');
    } else if (error.message.includes('invalid_client')) {
        console.error('Invalid client credentials');
    } else {
        console.error('Authentication failed:', error.message);
    }
}
```

## 💡 Examples

### Express.js Implementation

```typescript
import { KickAuthClient } from 'kick-auth';
import express from 'express';
import session from 'express-session';

const app = express();
const client = new KickAuthClient({
    clientId: process.env.KICK_CLIENT_ID!,
    clientSecret: process.env.KICK_CLIENT_SECRET!,
    redirectUri: process.env.KICK_REDIRECT_URI!,
    scopes: ['user:read']
});

app.use(session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false
}));

app.get('/auth/kick', async (req, res) => {
    const { url, state, codeVerifier } = await client.getAuthorizationUrl();
    req.session.state = state;
    req.session.codeVerifier = codeVerifier;
    res.redirect(url);
});

app.get('/auth/callback', async (req, res) => {
    const { code, state } = req.query;
    
    if (state !== req.session.state) {
        return res.status(400).send('Invalid state');
    }

    try {
        const tokens = await client.getAccessToken(
            code as string,
            req.session.codeVerifier
        );
        // Store tokens securely
        res.redirect('/dashboard');
    } catch (error) {
        res.status(500).send('Authentication failed');
    }
});
```

## 📘 TypeScript Support

The library is written in TypeScript and provides full type definitions:

```typescript
import { 
    KickAuthClient, 
    TokenResponse, 
    KickAuthConfig,
    TokenHintType 
} from 'kick-auth';

// Full type support for configuration
const config: KickAuthConfig = {
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret',
    redirectUri: 'https://your-app.com/callback',
    scopes: ['user:read']
};

// Type-safe token handling
const handleToken = (tokens: TokenResponse) => {
    console.log(tokens.access_token);
    console.log(tokens.refresh_token);
    console.log(tokens.expiry);
};
```