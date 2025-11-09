# AI Integration Guide

Complete guide for integrating AI capabilities into your Cloudflare Workers + React application.

## Overview: Choosing Your AI Provider

### Claude API (via Anthropic SDK)

**Best for:**
- Advanced reasoning and long-context tasks
- Production applications requiring high-quality responses
- When you need the latest Claude models (Sonnet 4.5, Opus, Haiku)
- Complex multi-turn conversations
- Document analysis and code generation

**Pricing:** Pay per token (input/output)
**Setup:** Requires Anthropic API key
**Limitations:** External API dependency, network latency

### Workers AI (Cloudflare Built-in)

**Best for:**
- Low-latency inference (runs on Cloudflare's network)
- Cost-sensitive applications (generous free tier)
- Simple text generation, embeddings, image generation
- When you want everything in one platform

**Pricing:** Pay per inference (very affordable, includes free tier)
**Setup:** No API key needed, use Cloudflare binding
**Limitations:** Limited model selection, less powerful than Claude API

### AI Gateway (Unified Proxy)

**Best for:**
- Caching AI responses to reduce costs
- Rate limiting and analytics
- Using multiple AI providers with unified interface
- Cost monitoring and control

**Pricing:** Free (you pay for underlying AI provider)
**Setup:** Create gateway in Cloudflare dashboard
**Limitations:** Adds slight latency, requires gateway configuration

**Recommendation:** Start with Claude API for quality, add AI Gateway for caching/monitoring, consider Workers AI for embeddings or cost-sensitive features.

## Quick Start

### 1. Get API Keys and Setup

#### For Claude API:

1. Sign up at https://console.anthropic.com/
2. Create an API key
3. Add to Cloudflare Workers secrets:

```bash
# For production
npx wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted

# For local development, add to .env
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

4. Update `wrangler.jsonc`:

```jsonc
{
  "name": "your-worker",
  "vars": {
    // Public variables
  }
  // Secrets are managed via `wrangler secret put`
  // No need to define them in wrangler.jsonc
}
```

#### For Workers AI:

1. No API key needed!
2. Update `wrangler.jsonc`:

```jsonc
{
  "ai": {
    "binding": "AI"
  }
}
```

3. Generate TypeScript types:

```bash
npm run cf-typegen
```

#### For AI Gateway:

1. Create gateway in Cloudflare dashboard: https://dash.cloudflare.com/
2. Navigate to AI > AI Gateway
3. Create new gateway (e.g., "my-app-gateway")
4. Note your gateway endpoint
5. Update `wrangler.jsonc`:

```jsonc
{
  "vars": {
    "AI_GATEWAY_ID": "your-gateway-id",
    "AI_GATEWAY_ACCOUNT": "your-account-id"
  }
}
```

### 2. Install Dependencies

#### For Claude API:

```bash
npm install @anthropic-ai/sdk
```

#### For Workers AI:

No dependencies needed - uses built-in binding.

## Integration Patterns

### Pattern 1: Claude API via Anthropic SDK

**Worker endpoint** (`worker/index.ts`):

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();

        const anthropic = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: message,
          }],
        });

        const textContent = response.content.find(c => c.type === 'text');

        return Response.json({
          success: true,
          response: textContent?.text || '',
          usage: response.usage,
        });
      } catch (error) {
        console.error('AI API error:', error);
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### Pattern 2: Workers AI (Cloudflare Built-in)

**Worker endpoint** (`worker/index.ts`):

```typescript
interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();

        const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [{
            role: 'user',
            content: message,
          }],
        });

        return Response.json({
          success: true,
          response: response.response,
        });
      } catch (error) {
        console.error('Workers AI error:', error);
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

**Available Workers AI models:**
- `@cf/meta/llama-3.1-8b-instruct` - Text generation
- `@cf/meta/llama-3.1-70b-instruct` - More powerful text generation
- `@cf/baai/bge-base-en-v1.5` - Text embeddings
- `@cf/stabilityai/stable-diffusion-xl-base-1.0` - Image generation

See full list: https://developers.cloudflare.com/workers-ai/models/

### Pattern 3: AI Gateway (with Claude API)

**Worker endpoint** (`worker/index.ts`):

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
  AI_GATEWAY_ID: string;
  AI_GATEWAY_ACCOUNT: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();

        // Configure Anthropic SDK to use AI Gateway
        const anthropic = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
          baseURL: `https://gateway.ai.cloudflare.com/v1/${env.AI_GATEWAY_ACCOUNT}/${env.AI_GATEWAY_ID}/anthropic`,
        });

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: message,
          }],
        });

        const textContent = response.content.find(c => c.type === 'text');

        return Response.json({
          success: true,
          response: textContent?.text || '',
          usage: response.usage,
        });
      } catch (error) {
        console.error('AI API error:', error);
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

## Code Examples

### Simple Chat Endpoint (Worker)

Complete worker implementation with proper error handling:

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers for frontend communication
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message, conversationHistory = [] }: ChatRequest = await request.json();

        // Validate input
        if (!message || typeof message !== 'string') {
          return Response.json({
            success: false,
            error: 'Invalid message',
          }, { status: 400, headers: corsHeaders });
        }

        // Rate limiting check (implement based on your needs)
        // const rateLimitOk = await checkRateLimit(request);
        // if (!rateLimitOk) {
        //   return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
        // }

        const anthropic = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });

        // Build messages array from history + new message
        const messages = [
          ...conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'user' as const,
            content: message,
          },
        ];

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 2048,
          messages,
        });

        const textContent = response.content.find(c => c.type === 'text');

        return Response.json({
          success: true,
          response: textContent?.text || '',
          usage: {
            inputTokens: response.usage.input_tokens,
            outputTokens: response.usage.output_tokens,
          },
        }, { headers: corsHeaders });
      } catch (error) {
        console.error('AI API error:', error);

        // Handle specific Anthropic errors
        if (error instanceof Anthropic.APIError) {
          return Response.json({
            success: false,
            error: `AI API error: ${error.message}`,
          }, { status: error.status || 500, headers: corsHeaders });
        }

        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500, headers: corsHeaders });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### React Chat Component

Complete chat UI component:

```typescript
import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Remove the user message if request failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>AI Chat</h1>

      <div className="messages" style={{
        height: '400px',
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: '#f9f9f9',
      }}>
        {messages.length === 0 && (
          <p style={{ color: '#999' }}>Start a conversation...</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '12px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: msg.role === 'user' ? '#007bff' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#000',
              marginLeft: msg.role === 'user' ? '20%' : '0',
              marginRight: msg.role === 'assistant' ? '20%' : '0',
              border: msg.role === 'assistant' ? '1px solid #ddd' : 'none',
            }}
          >
            <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
            <p style={{ margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div style={{ color: '#999', fontStyle: 'italic' }}>AI is thinking...</div>
        )}
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '16px',
        }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### Streaming Responses (SSE)

**Worker with streaming:**

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat-stream' && request.method === 'POST') {
      try {
        const { message } = await request.json();

        const anthropic = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });

        // Create ReadableStream for SSE
        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();

            try {
              const stream = await anthropic.messages.stream({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 2048,
                messages: [{ role: 'user', content: message }],
              });

              for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' &&
                    chunk.delta.type === 'text_delta') {
                  const data = JSON.stringify({ text: chunk.delta.text });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              }

              // Send done event
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              const errorData = JSON.stringify({
                error: error instanceof Error ? error.message : 'Unknown error'
              });
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

**React component for streaming:**

```typescript
import { useState, useRef } from 'react';

export default function StreamingChat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const currentMessageRef = useRef('');

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;

    setStreaming(true);
    currentMessageRef.current = '';

    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setMessages(prev => [...prev, currentMessageRef.current]);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                currentMessageRef.current += parsed.text;
                // Force re-render to show streaming text
                setMessages(prev => [...prev.slice(0, -1), currentMessageRef.current]);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setStreaming(false);
      setInput('');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Streaming AI Chat</h1>

      <div style={{ marginBottom: '20px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            padding: '12px',
            marginBottom: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
          }}>
            {msg}
          </div>
        ))}
        {streaming && currentMessageRef.current && (
          <div style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
          }}>
            {currentMessageRef.current}
            <span style={{ animation: 'blink 1s infinite' }}>▊</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={streaming}
          style={{ flex: 1, padding: '12px', fontSize: '16px' }}
        />
        <button onClick={sendMessage} disabled={streaming || !input.trim()}>
          {streaming ? 'Streaming...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
```

### Error Handling Patterns

**Comprehensive error handling:**

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
}

async function handleAIRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const { message } = await request.json();

    // Input validation
    if (!message || typeof message !== 'string') {
      return Response.json({
        success: false,
        error: 'Invalid message format',
      }, { status: 400 });
    }

    if (message.length > 10000) {
      return Response.json({
        success: false,
        error: 'Message too long (max 10000 characters)',
      }, { status: 400 });
    }

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      messages: [{ role: 'user', content: message }],
    });

    const textContent = response.content.find(c => c.type === 'text');

    return Response.json({
      success: true,
      response: textContent?.text || '',
    });
  } catch (error) {
    console.error('AI request error:', error);

    // Handle Anthropic-specific errors
    if (error instanceof Anthropic.APIError) {
      switch (error.status) {
        case 400:
          return Response.json({
            success: false,
            error: 'Invalid request to AI API',
          }, { status: 400 });
        case 401:
          return Response.json({
            success: false,
            error: 'AI API authentication failed',
          }, { status: 500 });
        case 429:
          return Response.json({
            success: false,
            error: 'Rate limit exceeded. Please try again later.',
          }, { status: 429 });
        case 500:
        case 529:
          return Response.json({
            success: false,
            error: 'AI service temporarily unavailable',
          }, { status: 503 });
        default:
          return Response.json({
            success: false,
            error: `AI API error: ${error.message}`,
          }, { status: error.status || 500 });
      }
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return Response.json({
        success: false,
        error: 'Invalid JSON in request',
      }, { status: 400 });
    }

    // Generic error handler
    return Response.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleAIRequest(request, env);
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

## Security Best Practices

### API Key Management

**Never commit secrets to code:**

```bash
# ❌ NEVER do this
ANTHROPIC_API_KEY=sk-ant-abc123  # in wrangler.jsonc or code

# ✅ Use Cloudflare secrets
npx wrangler secret put ANTHROPIC_API_KEY

# ✅ For local development, use .env (gitignored)
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

### Rate Limiting

**Implement rate limiting using Cloudflare KV:**

```typescript
interface Env {
  ANTHROPIC_API_KEY: string;
  RATE_LIMIT_KV: KVNamespace;
}

async function checkRateLimit(
  request: Request,
  env: Env
): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${ip}`;

  const current = await env.RATE_LIMIT_KV.get(key);
  const count = current ? parseInt(current) : 0;

  // 10 requests per hour
  if (count >= 10) {
    return false;
  }

  // Increment counter with 1-hour TTL
  await env.RATE_LIMIT_KV.put(key, String(count + 1), {
    expirationTtl: 3600,
  });

  return true;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const allowed = await checkRateLimit(request, env);
      if (!allowed) {
        return Response.json({
          success: false,
          error: 'Rate limit exceeded. Try again later.',
        }, { status: 429 });
      }

      // ... rest of chat logic
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### Input Validation

**Always validate and sanitize user input:**

```typescript
function validateChatMessage(message: unknown): string {
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (trimmed.length > 10000) {
    throw new Error('Message too long (max 10000 characters)');
  }

  // Optional: Sanitize for common injection patterns
  // For Claude, the API handles this internally, but good to be aware

  return trimmed;
}
```

### Cost Controls

**Set maximum token limits:**

```typescript
const MAX_TOKENS = 2048;  // Adjust based on your budget
const MAX_INPUT_LENGTH = 10000;  // Characters

// In your API handler:
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: MAX_TOKENS,  // Hard limit
  messages: [{ role: 'user', content: message }],
});

// Monitor usage
console.log('Token usage:', {
  input: response.usage.input_tokens,
  output: response.usage.output_tokens,
  total: response.usage.input_tokens + response.usage.output_tokens,
});
```

**Use AI Gateway for caching:**

```typescript
// Responses are automatically cached by AI Gateway
// Configure cache TTL in Cloudflare dashboard
// Can save 90%+ on repeated queries
```

## Performance Optimization

### 1. Use AI Gateway Caching

Configure caching in AI Gateway to reduce costs and latency for repeated queries:

- Semantic caching for similar queries
- Exact match caching
- Configure TTL based on use case

### 2. Choose the Right Model

```typescript
// For simple tasks, use faster/cheaper models:
const MODELS = {
  simple: 'claude-haiku-3-5-20250929',      // Fast, cheap
  balanced: 'claude-sonnet-4-5-20250929',   // Good balance
  complex: 'claude-opus-4-5-20250929',      // Most capable
};

// Select based on task complexity
const model = taskComplexity === 'high'
  ? MODELS.complex
  : MODELS.simple;
```

### 3. Stream Responses for Better UX

Streaming provides immediate feedback and better perceived performance:

```typescript
// Use streaming for long responses
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 2048,
  messages: [{ role: 'user', content: message }],
});

// User sees results immediately instead of waiting
```

### 4. Optimize Token Usage

```typescript
// Be concise with system prompts
const systemPrompt = "Be concise.";  // Good
const systemPrompt = "Please provide concise and brief responses...";  // Wasteful

// Limit conversation history
const recentHistory = conversationHistory.slice(-10);  // Keep last 10 messages

// Use appropriate max_tokens
const max_tokens = isSimpleQuery ? 256 : 2048;
```

## Troubleshooting Common Issues

### Issue: "API Key Invalid" Error

**Solution:**
```bash
# Verify secret is set
npx wrangler secret list

# If missing, add it
npx wrangler secret put ANTHROPIC_API_KEY

# For local dev, check .env file exists
cat .env

# Ensure .env is in .gitignore
rg "^\.env$" .gitignore
```

### Issue: CORS Errors from Frontend

**Solution:**
```typescript
// Add CORS headers to all API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',  // Or specific origin
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

// Include in all responses
return Response.json(data, { headers: corsHeaders });
```

### Issue: Rate Limits / 429 Errors

**Solution:**
```typescript
// Implement exponential backoff
async function callWithRetry(fn: () => Promise<any>, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Anthropic.APIError && error.status === 429) {
        const delay = Math.pow(2, i) * 1000;  // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### Issue: Streaming Not Working

**Solution:**
```typescript
// Ensure proper headers
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  },
});

// On client side, ensure proper SSE handling
const response = await fetch('/api/chat-stream', { method: 'POST' });
const reader = response.body!.getReader();
const decoder = new TextDecoder();

// Read chunks properly
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  // Process chunk
}
```

### Issue: TypeScript Errors for env.AI

**Solution:**
```bash
# Regenerate Cloudflare types after updating wrangler.jsonc
npm run cf-typegen

# This generates worker-configuration.d.ts with proper types
```

### Issue: Large Token Usage / High Costs

**Solution:**
```typescript
// 1. Set strict token limits
max_tokens: 1024  // Instead of 4096

// 2. Truncate input
const truncatedMessage = message.slice(0, 5000);

// 3. Use AI Gateway caching
// 4. Choose cheaper models for simple tasks
// 5. Monitor usage in logs

console.log('Cost estimate:', {
  inputTokens: response.usage.input_tokens,
  outputTokens: response.usage.output_tokens,
  estimatedCost: (response.usage.input_tokens * 0.003 / 1000) +
                 (response.usage.output_tokens * 0.015 / 1000),
});
```

## Next Steps

1. **Choose your AI provider** based on your use case
2. **Set up API keys** following security best practices
3. **Start with a simple chat endpoint** to verify everything works
4. **Add error handling and rate limiting** before going to production
5. **Implement caching** via AI Gateway to reduce costs
6. **Monitor usage** and optimize based on your needs

## Additional Resources

- **Anthropic API Docs:** https://docs.anthropic.com/
- **Cloudflare Workers AI:** https://developers.cloudflare.com/workers-ai/
- **AI Gateway:** https://developers.cloudflare.com/ai-gateway/
- **Anthropic SDK:** https://github.com/anthropics/anthropic-sdk-typescript
- **Model Pricing:** https://www.anthropic.com/pricing
- **Best Practices:** https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering

---

For quick setup, use the `/add-ai-feature` slash command to generate boilerplate code automatically.
