# Kick.com API Client

[![NPM Version](https://img.shields.io/npm/v/@botk4cp3r/kick.js)](https://www.npmjs.com/package/@botk4cp3r/kick.js)
[![License](https://img.shields.io/npm/l/@botk4cp3r/kick.js)](https://github.com/BOT-K4CP3R/kick.api/blob/main/LICENSE)

## 📋 Table of Contents
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Chat System](#-chat-system)
- [Webhook Events](#-webhook-events)
- [Channel Management](#-channel-management)
- [Category System](#-category-system)
- [User Management](#-user-management)
- [Error Handling](#-error-handling)
- [TypeScript Support](#-typescript-support)
- [Examples](#-examples)

## 📥 Installation

```bash
npm install @botk4cp3r/kick.jsapi
# or
yarn add @botk4cp3r/kick.js
# or
pnpm add @botk4cp3r/kick.js
```

## 🚀 Quick Start

```javascript
const { KickClient } = require('@botk4cp3r/kick.js');

// Create client instance
const client = new KickClient({
    token: 'your-api-token',
    webhookPort: 3000,
    webhookPath: '/webhook',
    webhookBaseUrl: 'http://your-domain.com'
});

// Start webhook server and subscribe to events
async function init() {
    await client.startWebhookServer();
    
    // Subscribe to all available events
    await client.subscribeToEvents([
        'chat.message.sent',
        'channel.followed',
        'channel.subscription.new',
        'channel.subscription.renewal',
        'channel.subscription.gifts'
    ]);
    
    console.log('Bot is ready!');
}

// Listen for events
client.on('chatMessage', message => {
    console.log(`${message.sender.username}: ${message.content}`);
});

client.on('channelFollowed', data => {
    console.log(`New follower: ${data.follower.username}!`);
});

client.on('subscriptionNew', data => {
    console.log(`New sub: ${data.subscriber.username}!`);
});

// Send a chat message
await client.sendChatMessage({
    content: 'Hello World!',
    type: 'bot'
});

init().catch(console.error);
```

## 💬 Chat System

### Send Bot Messages
```javascript
// Simple bot message
await client.sendChatMessage({
    content: 'Hello from bot!',
    type: 'bot'
});

// Simple user message
await client.sendChatMessage({
    content: 'Hello! Kappa',
    type: 'user',
    broadcasterUserId: '123456'
});
```

### Listen for Chat Events
```javascript
// New messages
client.on('chatMessage', msg => {
    console.log(`${msg.sender.username}: ${msg.content}`);
    
    // Auto-respond to commands
    if (msg.content === '!ping') {
        client.sendChatMessage({
            content: 'Pong! 🏓',
            type: 'bot'
        });
    }
});
```

## 📡 Webhook Events

### Start Webhook Server
```javascript
const client = new KickClient({
    token: 'your-api-token',
    webhookPort: 3000,
    webhookPath: '/webhook',
    webhookBaseUrl: 'http://your-domain.com'
});

await client.startWebhookServer();
```

### Subscribe to Events
```javascript
// Subscribe to specific events
await client.subscribeToEvents([
    'chat.message.sent',
    'channel.followed',
    'subscription.new',
    'channel.subscription.renewal',
    'channel.subscription.gifts'
]);

// Listen for events
client.on('channelFollowed', data => {
    console.log(`New follower: ${data.follower.username}`);
});

client.on('subscriptionNew', data => {
    console.log(`New sub: ${data.subscriber.username}`);
});
```

### Custom Event Handlers
```javascript
client.on('chatMessage', async (message) => {
    // Command system example
    const commands = {
        '!ping': () => 'Pong! 🏓',
        '!discord': () => 'Join our Discord: discord.gg/example'
    };

    const command = message.content.toLowerCase();
    if (commands[command]) {
        await client.sendChatMessage({
            content: commands[command](),
            type: 'bot'
        });
    }
});
```

## 🎯 Event Subscriptions

### Available Events
```javascript
const AVAILABLE_EVENTS = {
    'chat.message.sent',        // New chat messages
    'channel.followed',         // When someone follows the channel
    'channel.subscription.renewal', // Subscription renewals
    'channel.subscription.gifts',   // Gifted subscriptions
    'channel.subscription.new'      // New subscriptions
};
```

### Managing Subscriptions

```javascript
// Get current subscriptions
const currentSubs = await client.getEventSubscriptions();
console.log('Current subscriptions:', currentSubs);

// Subscribe to specific events
const subscription = await client.subscribeToEvents([
    'chat.message.sent',
    'channel.followed'
]);

// Subscribe with custom webhook method
const webhookSub = await client.subscribeToEvents([
    'channel.subscription.new', 
    'channel.subscription.gifts'
]);

// Unsubscribe from events
await client.unsubscribeFromEvents(['subscription-id-1', 'subscription-id-2']);
```

### Event Validation

```javascript
// Validate incoming webhook
const isValid = await client.validateWebhook(headers, rawBody);
if (isValid) {
    console.log('Valid webhook event!');
}
```

### Full Subscription Example

```javascript
const client = new KickClient({
    token: 'your-api-token',
    webhookPort: 3000,
    webhookPath: '/webhook',
    webhookBaseUrl: 'https://your-domain.com'
});

// Start webhook server
await client.startWebhookServer();

// Subscribe to multiple events
await client.subscribeToEvents([
    'chat.message.sent',
    'channel.followed',
    'subscription.new',
    'subscription.renewal',
    'subscription.gifts'
]);

// Handle different events
client.on('chatMessage', msg => {
    console.log(`Chat: ${msg.sender.username}: ${msg.content}`);
});

client.on('channelFollowed', data => {
    console.log(`New follower: ${data.follower.username}`);
});

client.on('subscriptionNew', sub => {
    console.log(`New sub: ${sub.subscriber.username}`);
});

client.on('subscriptionRenewal', renewal => {
    console.log(`Renewal: ${renewal.subscriber.username}`);
});

client.on('subscriptionGifts', gifts => {
    console.log(`${gifts.gifter.username} gifted ${gifts.giftees.length} subs!`);
});

// Error handling
client.on('error', error => {
    console.error('Subscription error:', error);
});
```

### Webhook Payload Examples

#### Chat Message Event
```javascript
{
    eventType: 'chat.message.sent',
    payload: {
        messageId: '123456',
        content: 'Hello world!',
        sender: {
            id: '789',
            username: 'username',
            displayName: 'Display Name'
        },
        emotes: [
            {
                id: '123',
                name: 'Kappa',
                position: { start: 6, end: 11 }
            }
        ]
    }
}
```

#### Follow Event
```javascript
{
    eventType: 'channel.followed',
    payload: {
        broadcaster: {
            id: '123',
            username: 'broadcaster'
        },
        follower: {
            id: '456',
            username: 'follower'
        }
    }
}
```

#### Subscription Event
```javascript
{
    eventType: 'subscription.new',
    payload: {
        broadcaster: {
            id: '123',
            username: 'broadcaster'
        },
        subscriber: {
            id: '456',
            username: 'subscriber'
        },
        tier: 1,
        months: 1
    }
}
```

## 📺 Channel Management

### Get Channel Info
```javascript
// Get single channel
const channel = await client.getChannels(['123456']);

// Get multiple channels
const channels = await client.getChannels(['123', '456', '789']);
```

### Update Channel
```javascript
// Update stream title and category
await client.updateChannel({
    categoryId: '123',
    streamTitle: '🔴 New Stream Title!'
});

// Update just title
await client.updateChannel({
    streamTitle: '🔴 Playing Games!'
});
```

## 🎮 Category System

### Search Categories
```javascript
// Search all categories
const allCategories = await client.searchCategories();

// Search specific game
const gaming = await client.searchCategories('Minecraft');

// Get category by ID
const category = await client.getCategory('123');
```

## 👥 User Management

### Get User Information
```javascript
// Get single user
const user = await client.getUsers(['123456']);

// Get multiple users
const users = await client.getUsers(['123', '456', '789']);
```

## 🚨 Error Handling

```javascript
try {
    await client.sendChatMessage({
        content: 'Test message'
    });
} catch (error) {
    if (error instanceof UnauthorizedError) {
        console.error('Token is invalid or expired');
    } else if (error instanceof ForbiddenError) {
        console.error('Insufficient permissions');
    } else if (error instanceof RateLimitError) {
        console.error(`Rate limited. Try again in ${error.retryAfter} seconds`);
    } else {
        console.error('Unknown error:', error.message);
    }
}
```

## 📝 TypeScript Support

```typescript
import { 
    KickClient, 
    ChatMessageOptions,
    ChannelUpdateOptions,
    WebhookEventType
} from '@botk4cp3r/kick.js';

// Client with typed options
const client = new KickClient({
    token: string,
    webhookPort: number,
    webhookPath: string,
    webhookBaseUrl: string
});

// Typed message options
const messageOptions: ChatMessageOptions = {
    content: string,
    type: 'bot' | 'user',
    broadcasterUserId?: string
};

// Typed event handlers
client.on('chatMessage', (message: ChatMessage) => {
    console.log(message.content);
});
```

## 📚 Examples

### Chat Bot Example
```javascript
const { KickClient } = require('@botk4cp3r/kick.js');

const client = new KickClient({
    token: 'your-api-token',
    webhookPort: 3000,
    webhookPath: '/webhook',
    webhookBaseUrl: 'http://your-domain.com'
});

const commands = {
    '!help': 'Available commands: !help, !ping',
    '!ping': 'Pong! 🏓'
};

async function startBot() {
    try {
        // Start webhook server
        await client.startWebhookServer();
        
        // Subscribe to events
        await client.subscribeToEvents([
            'chat.message.sent',
            'channel.followed',
            'channel.subscription.new',
            'channel.subscription.renewal',
            'channel.subscription.gifts'
        ]);

        console.log('Bot started and subscribed to events!');
    } catch (error) {
        console.error('Failed to start bot:', error);
        process.exit(1);
    }
}

// Chat command handler
client.on('chatMessage', async (message) => {
    const command = message.content.toLowerCase();
    
    if (commands[command]) {
        await client.sendChatMessage({
            content: commands[command],
            type: 'bot'
        });
    }
});

// Event handlers
client.on('channelFollowed', async (data) => {
    await client.sendChatMessage({
        content: `Thanks for following, ${data.follower.username}! 🎉`,
        type: 'bot'
    });
});

client.on('subscriptionNew', async (data) => {
    await client.sendChatMessage({
        content: `Welcome to the team, ${data.subscriber.username}! 🎈`,
        type: 'bot'
    });
});

client.on('subscriptionRenewal', async (data) => {
    await client.sendChatMessage({
        content: `Thanks for resubbing, ${data.subscriber.username}! 💜`,
        type: 'bot'
    });
});

client.on('subscriptionGifts', async (data) => {
    await client.sendChatMessage({
        content: `Thanks ${data.gifter.username} for gifting ${data.giftees.length} subs! 🎁`,
        type: 'bot'
    });
});

startBot().catch(console.error);
```