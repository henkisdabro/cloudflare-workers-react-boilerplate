# Workers AI Chat Example

Edge-native AI integration using Cloudflare Workers AI with built-in models. This example demonstrates how to use Cloudflare's AI capabilities without external API dependencies, running inference directly at the edge for low-latency, cost-effective AI.

## What This Example Demonstrates

- Cloudflare Workers AI binding integration
- Edge-native AI inference (no external APIs)
- Using built-in models (Llama, Mistral, etc.)
- Cost-effective AI at scale
- TypeScript type safety with Workers AI
- No API key management (built into Cloudflare)

## Features

- Chat interface powered by Workers AI
- Multiple model options (Llama 3.1, Mistral, etc.)
- Edge inference (low latency worldwide)
- No external API dependencies
- Predictable pricing (included in Workers plan)
- Simple configuration (just add binding)

## Why Workers AI?

### Benefits
- **No External APIs**: Everything runs on Cloudflare's network
- **Low Latency**: Inference at the edge, close to users
- **Cost-Effective**: Included in Workers Paid plan, predictable pricing
- **Privacy**: Data stays on Cloudflare's network
- **Reliability**: Backed by Cloudflare's infrastructure
- **Simple Setup**: No API key management

### Use Cases
- High-volume chat applications
- Cost-sensitive deployments
- Privacy-focused applications
- Low-latency requirements
- Edge-native architectures

## Prerequisites

1. **Cloudflare Workers Paid Plan**
   - $5/month
   - Includes 10M neurons
   - Additional usage: $0.011 per 1,000 neurons
   - [Sign up here](https://dash.cloudflare.com/)

2. **Cloudflare Account**
   - Wrangler CLI configured
   - Workers AI enabled

3. **This Boilerplate Project**
   - Vite + React 19 + TypeScript
   - Cloudflare Workers setup

## Setup Instructions

### 1. Enable Workers AI Binding

Update your `wrangler.jsonc`:

```jsonc
{
  "name": "your-worker-name",
  "main": "worker/index.ts",
  "compatibility_date": "2025-11-09",
  // ... existing config ...
  "ai": {
    "binding": "AI"
  }
}
```

### 2. Generate TypeScript Types

After adding the AI binding, generate types:

```bash
npm run cf-typegen
```

This updates `worker-configuration.d.ts` with AI binding types.

### 3. No Dependencies to Install

Workers AI is built-in - no npm packages needed!

### 4. Integrate Worker Endpoint

Copy the code from `worker-endpoint.ts` to your `worker/index.ts`:

```typescript
// worker/index.ts
import { handleWorkersAIChat } from './api/workers-ai-chat';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/ai-chat' && request.method === 'POST') {
      return handleWorkersAIChat(request, env);
    }

    // ... existing routes ...

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### 5. Add React Component

1. Copy `WorkersAiChat.tsx` to `src/components/WorkersAiChat.tsx`
2. Copy `types.ts` to `src/types/workers-ai-chat.ts`

### 6. Use the Component

```tsx
// src/App.tsx
import WorkersAiChat from './components/WorkersAiChat';

function App() {
  return (
    <div className="App">
      <h1>Edge AI Chat</h1>
      <WorkersAiChat />
    </div>
  );
}

export default App;
```

## Testing Locally

### With Wrangler Dev

```bash
# Start with wrangler (uses remote AI binding)
npx wrangler dev
```

**Note**: Local development uses remote AI binding (requires internet connection). This is normal for Workers AI.

### Test the Chat

1. Navigate to http://localhost:8787 (or wrangler dev port)
2. Type a message
3. See response from Workers AI

## API Endpoint Details

### POST /api/ai-chat

**Request Body:**
```json
{
  "message": "Your message here",
  "conversationHistory": [
    {"role": "user", "content": "Previous message"},
    {"role": "assistant", "content": "Previous response"}
  ],
  "model": "@cf/meta/llama-3.1-8b-instruct" // Optional
}
```

**Response (Success):**
```json
{
  "message": "AI response",
  "model": "@cf/meta/llama-3.1-8b-instruct"
}
```

**Response (Error):**
```json
{
  "error": "Error message"
}
```

## Available Models

Cloudflare Workers AI supports multiple models. Popular options:

### Text Generation Models

| Model | Name | Use Case | Context Length |
|-------|------|----------|----------------|
| **Llama 3.1 8B** | `@cf/meta/llama-3.1-8b-instruct` | General purpose, best quality | 8,192 tokens |
| **Llama 3.2 1B** | `@cf/meta/llama-3.2-1b-instruct` | Fast, lightweight | 4,096 tokens |
| **Mistral 7B** | `@cf/mistral/mistral-7b-instruct-v0.1` | Good balance | 8,192 tokens |

### Recommended Models

- **Best Quality**: `@cf/meta/llama-3.1-8b-instruct`
- **Fastest**: `@cf/meta/llama-3.2-1b-instruct`
- **Balanced**: `@cf/mistral/mistral-7b-instruct-v0.1`

Full model catalog: https://developers.cloudflare.com/workers-ai/models/

## Cost Estimates

### Workers AI Pricing

- **Included**: 10M neurons with Workers Paid plan ($5/month)
- **Additional**: $0.011 per 1,000 neurons
- **No per-request fees**

### What are Neurons?

Neurons are Cloudflare's unit of AI computation. Different models use different amounts:

- Llama 3.1 8B: ~100 neurons per request (varies by length)
- Llama 3.2 1B: ~50 neurons per request (smaller model)

### Example Costs

| Scenario | Requests/Month | Neurons | Cost |
|----------|----------------|---------|------|
| Light usage | 10,000 | ~1M | $5 (included) |
| Medium usage | 100,000 | ~10M | $5 (included) |
| Heavy usage | 1,000,000 | ~100M | $5 + ~$1 = $6 |

**Much cheaper than external APIs!**

## Customization Options

### Change Model

```typescript
// In worker-endpoint.ts
const response = await env.AI.run(
  '@cf/meta/llama-3.2-1b-instruct', // Faster model
  { messages }
);
```

### Adjust System Prompt

```typescript
const messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant that speaks like a pirate.',
  },
  ...conversationHistory,
  {
    role: 'user',
    content: userMessage,
  },
];
```

### Add Streaming (Optional)

```typescript
const response = await env.AI.run(
  '@cf/meta/llama-3.1-8b-instruct',
  { messages, stream: true }
);

// Return SSE stream (similar to streaming-chat example)
```

## Security Considerations

### Advantages
- **No API Keys**: No secrets to manage
- **Built-in Auth**: Uses Cloudflare account authentication
- **Network Isolation**: Data stays on Cloudflare network

### Still Implement
- Input validation
- Rate limiting (per user/IP)
- Content filtering
- Usage monitoring

### Rate Limiting Example

```typescript
// Simple rate limiting with in-memory map
const rateLimits = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimits.get(ip) || 0;

  if (now - lastRequest < 2000) { // 1 request per 2 seconds
    return false;
  }

  rateLimits.set(ip, now);
  return true;
}
```

## Troubleshooting

### Issue: "AI binding not found"
**Solution**:
1. Add AI binding to `wrangler.jsonc`
2. Run `npm run cf-typegen`
3. Restart dev server

### Issue: "Workers AI requires paid plan"
**Solution**: Upgrade to Workers Paid plan ($5/month)
```bash
# Check your plan in Cloudflare dashboard
# Upgrade at: dash.cloudflare.com
```

### Issue: Slow responses
**Solutions**:
- Use smaller model (Llama 3.2 1B instead of 3.1 8B)
- Reduce max_tokens
- Check if you're being rate-limited

### Issue: Quality not as good as Claude
**Expectation**: Workers AI uses smaller models than Claude
**Solutions**:
- Use Llama 3.1 8B (best quality)
- Adjust prompts for better results
- For critical quality needs, use Claude API examples

### Issue: Local development not working
**Note**: Workers AI requires internet connection even in local dev (uses remote binding)
```bash
# This is normal and expected
npx wrangler dev  # Will connect to remote AI binding
```

## Differences from Claude API Examples

| Feature | Claude API | Workers AI |
|---------|------------|------------|
| **Setup** | API key required | Just add binding |
| **Cost** | Per token | Per neuron (much cheaper) |
| **Quality** | Best available | Good (smaller models) |
| **Latency** | Medium | Very low (edge) |
| **Privacy** | External API | Cloudflare network |
| **Pricing** | Variable | Predictable |
| **Dependencies** | npm package | Built-in |

## Performance Characteristics

### Latency
- **Edge inference**: 50-200ms typical
- **Global distribution**: Consistent worldwide
- **No external API calls**: Eliminates network overhead

### Throughput
- **Concurrent requests**: Handles well at edge
- **Rate limits**: Generous with paid plan
- **Scalability**: Automatic with Workers

## Limitations

1. **Model Size**: Smaller models than GPT-4 or Claude
2. **Quality**: Good but not cutting-edge
3. **Context Length**: Limited compared to Claude (8k vs 200k)
4. **Features**: Fewer features than major providers
5. **Local Dev**: Requires internet connection (remote binding)

## When to Use Workers AI vs Claude API

### Use Workers AI When:
- Cost is a primary concern
- High request volume expected
- Low latency is critical
- Privacy/data locality important
- Building edge-native apps
- Good quality is acceptable

### Use Claude API When:
- Best quality required
- Long context needed
- Advanced features needed
- Lower volume expected
- Cost per request acceptable

## Next Steps

### Enhancements You Can Make
1. **Add Streaming**: Implement SSE streaming
2. **Add Model Selection**: Let users choose model
3. **Add Content Filtering**: Filter inappropriate content
4. **Add Usage Tracking**: Monitor neuron usage
5. **Add Caching**: Cache common queries in KV

### Related Examples
- [Simple Claude Chat](../simple-claude-chat/) - Higher quality responses
- [Streaming Chat](../streaming-chat/) - Streaming pattern (adaptable)
- [Using Cloudflare AI Gateway](../with-ai-gateway/) - Multi-provider setup

## File Structure

```
workers-ai-chat/
├── README.md              # This file
├── worker-endpoint.ts     # Workers AI handler
├── WorkersAiChat.tsx      # React component
├── types.ts              # TypeScript types
└── PRP.md                # Implementation plan
```

## Model Selection Guide

Choose based on your needs:

```typescript
// Best quality (recommended)
'@cf/meta/llama-3.1-8b-instruct'

// Fastest responses
'@cf/meta/llama-3.2-1b-instruct'

// Good balance
'@cf/mistral/mistral-7b-instruct-v0.1'

// Coding tasks
'@cf/meta/llama-3.1-8b-instruct' // Best for code
```

## Support

- [Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Available Models](https://developers.cloudflare.com/workers-ai/models/)
- [Pricing Calculator](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Cloudflare Community](https://community.cloudflare.com/)

## License

Part of the Cloudflare Workers + React boilerplate.
