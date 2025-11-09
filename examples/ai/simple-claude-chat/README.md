# Simple Claude Chat Example

A basic implementation of Claude API integration without streaming. This example demonstrates the simplest way to add AI chat capabilities to your Cloudflare Workers + React application.

## What This Example Demonstrates

- Basic Claude API integration using the Anthropic SDK
- Complete request/response cycle
- Error handling and validation
- Loading states and user feedback
- TypeScript type safety
- Clean separation between Worker and React code

## Features

- Simple chat interface with message history
- Non-streaming responses (complete response returned at once)
- Error handling with user-friendly messages
- Loading indicators during API calls
- TypeScript types for type safety
- Minimal dependencies

## Prerequisites

1. **Anthropic API Key**
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Generate an API key
   - Free tier available for testing

2. **Cloudflare Account**
   - Free tier works fine
   - Workers deployment enabled

3. **This Boilerplate Project**
   - Vite + React 19 + TypeScript
   - Cloudflare Workers setup

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### 2. Configure API Key

For local development, create a `.dev.vars` file in your project root:

```bash
# .dev.vars (DO NOT COMMIT)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

For production, add the secret to Cloudflare:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# Enter your API key when prompted
```

### 3. Update wrangler.jsonc

Add environment variable binding (optional, for type safety):

```jsonc
{
  "name": "your-worker-name",
  // ... existing config ...
  "vars": {
    "ANTHROPIC_API_KEY": ""  // Empty in config, use secrets for actual value
  }
}
```

### 4. Integrate Worker Endpoint

Copy the code from `worker-endpoint.ts` and add it to your `worker/index.ts`:

```typescript
// worker/index.ts
import Anthropic from '@anthropic-ai/sdk';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Add the chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    // ... your existing routes ...

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;

// Paste the handleChat function from worker-endpoint.ts here
async function handleChat(request: Request, env: Env): Promise<Response> {
  // ... implementation from worker-endpoint.ts
}
```

### 5. Add React Component

1. Copy `ChatComponent.tsx` to `src/components/ChatComponent.tsx`
2. Copy `types.ts` to `src/types/chat.ts` (or wherever you keep types)

### 6. Use the Component

```tsx
// src/App.tsx
import ChatComponent from './components/ChatComponent';

function App() {
  return (
    <div className="App">
      <h1>My AI Chat App</h1>
      <ChatComponent />
    </div>
  );
}

export default App;
```

## Testing Locally

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test the Chat**
   - Open http://localhost:5173 (or your dev port)
   - Type a message in the chat input
   - Click Send
   - Wait for Claude's response

3. **Check for Errors**
   - Open browser console for client-side errors
   - Check terminal for worker errors

## Deployment

```bash
# Build and deploy to Cloudflare
npm run deploy
```

After deployment, test your production endpoint:
```bash
curl -X POST https://your-worker.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}'
```

## API Endpoint Details

### POST /api/chat

**Request Body:**
```json
{
  "message": "Your message here",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

**Response (Success):**
```json
{
  "message": "Claude's response",
  "model": "claude-3-5-sonnet-20241022"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

## Cost Estimates

### Claude 3.5 Sonnet Pricing (as of 2024)
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

### Example Costs
- 1,000 messages (avg 100 tokens input, 200 tokens output): ~$3.30
- 10,000 messages: ~$33
- 100,000 messages: ~$330

**Note**: Consider using Claude 3 Haiku for cost-sensitive applications (~80% cheaper)

## Customization Options

### Change Model

In `worker-endpoint.ts`, modify the model:

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307', // Cheaper, faster
  // or
  model: 'claude-3-5-sonnet-20241022', // Better quality
  // ...
});
```

### Adjust Max Tokens

```typescript
const message = await anthropic.messages.create({
  max_tokens: 1024, // Increase for longer responses
  // ...
});
```

### Add System Prompts

```typescript
const message = await anthropic.messages.create({
  system: "You are a helpful assistant that speaks like a pirate.",
  // ...
});
```

### Customize Temperature

```typescript
const message = await anthropic.messages.create({
  temperature: 0.7, // 0.0 = deterministic, 1.0 = creative
  // ...
});
```

## Error Handling

The example includes comprehensive error handling:

1. **API Key Missing**: Returns 500 with clear error message
2. **Invalid Request**: Returns 400 for malformed requests
3. **API Errors**: Catches and logs Anthropic API errors
4. **Network Errors**: Handles network failures gracefully

## Security Considerations

### DO NOT
- Commit API keys to git
- Expose API keys in client-side code
- Skip input validation
- Return raw error messages to users

### DO
- Store API keys in Cloudflare secrets
- Validate user input length
- Implement rate limiting (see below)
- Log errors securely

### Rate Limiting Example

```typescript
// Simple in-memory rate limiting (for production, use KV or Durable Objects)
const rateLimiter = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimiter.get(ip) || 0;

  if (now - lastRequest < 1000) { // 1 request per second
    return false;
  }

  rateLimiter.set(ip, now);
  return true;
}
```

## Troubleshooting

### Issue: "API key not found"
**Solution**: Ensure `ANTHROPIC_API_KEY` is set in `.dev.vars` (local) or Cloudflare secrets (production)

```bash
# Check if secret exists
npx wrangler secret list

# Add if missing
npx wrangler secret put ANTHROPIC_API_KEY
```

### Issue: CORS errors in browser
**Solution**: Add CORS headers in worker response (already included in example)

### Issue: Slow responses
**Solutions**:
- Use Claude 3 Haiku instead of Sonnet
- Reduce max_tokens
- Consider streaming (see streaming-chat example)

### Issue: High costs
**Solutions**:
- Switch to Claude 3 Haiku
- Implement caching for common queries
- Use AI Gateway (see with-ai-gateway example)
- Add request rate limiting

## Limitations

- No streaming (responses feel slower for long outputs)
- Basic conversation history (no persistence)
- No conversation context management
- Simple error handling

## Next Steps

### Improvements You Can Make
1. **Add Persistence**: Store conversation history in D1 or KV
2. **Add Streaming**: Use the streaming-chat example
3. **Add Authentication**: Require user login
4. **Add Rate Limiting**: Prevent abuse
5. **Add Caching**: Cache common queries in KV

### Related Examples
- [Streaming Chat](../streaming-chat/) - For better UX with streaming
- [Workers AI Chat](../workers-ai-chat/) - For edge-native AI
- [Using Cloudflare AI Gateway](../with-ai-gateway/) - For production deployments

## File Structure

```
simple-claude-chat/
├── README.md              # This file
├── worker-endpoint.ts     # Worker API handler
├── ChatComponent.tsx      # React chat UI
├── types.ts              # TypeScript types
└── PRP.md                # Implementation plan
```

## Support

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Main Project README](../../../README.md)

## License

Part of the Cloudflare Workers + React boilerplate.
