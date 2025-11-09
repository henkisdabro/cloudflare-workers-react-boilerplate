# Add AI Feature - Interactive Wizard

Guide the user through adding AI capabilities to their Cloudflare Workers + React application.

## Step 1: Choose AI Provider

Ask the user to choose an AI provider:

**Options:**

1. **Claude API (Anthropic)** - Best for high-quality responses, advanced reasoning
   - Requires: Anthropic API key
   - Pros: Latest Claude models, best quality
   - Cons: External dependency, pay per token
   - Best for: Production apps, complex tasks

2. **Workers AI (Cloudflare)** - Best for low-latency, cost-sensitive apps
   - Requires: Cloudflare binding (no API key)
   - Pros: Built-in, generous free tier, low latency
   - Cons: Limited model selection
   - Best for: Embeddings, simple generation, cost-sensitive features

3. **AI Gateway (Unified)** - Best for caching, monitoring, cost control
   - Requires: AI Gateway configuration + underlying provider
   - Pros: Caching, analytics, unified interface
   - Cons: Slight latency overhead
   - Best for: Production apps with caching needs

**Ask:** "Which AI provider would you like to use? (1, 2, or 3)"

## Step 2: Choose Feature Type

Based on their provider choice, ask them to choose a feature type:

**Options:**

1. **Simple Chat** - Basic request/response chat
   - Single endpoint, non-streaming
   - Good for: Simple Q&A, basic chat

2. **Streaming Chat** - Real-time streaming responses
   - Server-sent events (SSE)
   - Good for: Better UX, long responses

3. **Text Completion** - Simple text completion
   - No conversation history
   - Good for: Autocomplete, suggestions

4. **Image Generation** - Generate images (Workers AI only)
   - Only available with Workers AI
   - Uses Stable Diffusion XL

5. **Embeddings/RAG** - Text embeddings for semantic search
   - Good for: Search, recommendations, RAG systems

**Ask:** "Which feature type do you want to implement? (1-5)"

## Step 3: Generate Files

Based on their selections, generate the appropriate files:

### For All Options:

1. **Update worker/index.ts** - Add API endpoint
2. **Create React component** - Add UI component in src/components/
3. **Create TypeScript types** - Add types in src/types/
4. **Update wrangler.jsonc** (if needed) - Add bindings/env vars
5. **Generate setup guide** - Print environment setup instructions

### File Generation Logic:

#### If Claude API + Simple Chat:

1. **worker/index.ts** - Use template: `.claude/templates/ai-worker-claude-api.ts`
2. **src/components/AIChat.tsx** - Use template: `.claude/templates/ai-chat-component.tsx`
3. **src/types/ai.ts** - Generate chat types
4. **Setup instructions:**
   - Install @anthropic-ai/sdk
   - Add ANTHROPIC_API_KEY secret
   - Update wrangler.jsonc (if using AI Gateway)

#### If Claude API + Streaming Chat:

1. **worker/index.ts** - Use template: `.claude/templates/ai-streaming-response.ts`
2. **src/components/AIStreamingChat.tsx** - Generate streaming component
3. **src/types/ai.ts** - Generate streaming types
4. **Setup instructions:**
   - Install @anthropic-ai/sdk
   - Add ANTHROPIC_API_KEY secret

#### If Workers AI + Simple Chat:

1. **worker/index.ts** - Use template: `.claude/templates/ai-worker-workers-ai.ts`
2. **src/components/AIChat.tsx** - Use template: `.claude/templates/ai-chat-component.tsx`
3. **src/types/ai.ts** - Generate chat types
4. **wrangler.jsonc** - Add AI binding
5. **Setup instructions:**
   - Add AI binding to wrangler.jsonc
   - Run `npm run cf-typegen`

#### If Workers AI + Image Generation:

1. **worker/index.ts** - Generate image endpoint
2. **src/components/ImageGenerator.tsx** - Generate image UI
3. **src/types/ai.ts** - Generate image types
4. **wrangler.jsonc** - Add AI binding
5. **Setup instructions:**
   - Add AI binding to wrangler.jsonc
   - Run `npm run cf-typegen`

#### If Embeddings/RAG:

1. **worker/index.ts** - Generate embeddings endpoint
2. **src/components/SemanticSearch.tsx** - Generate search UI
3. **src/types/ai.ts** - Generate embeddings types
4. **wrangler.jsonc** - Add AI/KV bindings
5. **Setup instructions:**
   - Add AI and KV bindings
   - Run `npm run cf-typegen`

## Step 4: Implementation Steps

After generating files, provide clear implementation steps:

### Implementation Checklist:

1. **Install Dependencies** (if needed)
   ```bash
   # For Claude API
   npm install @anthropic-ai/sdk
   ```

2. **Configure Secrets** (if needed)
   ```bash
   # For Claude API
   npx wrangler secret put ANTHROPIC_API_KEY

   # For local development
   echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
   ```

3. **Update wrangler.jsonc** (if needed)
   - Show exact configuration to add
   - Explain what each binding does

4. **Generate TypeScript Types**
   ```bash
   npm run cf-typegen
   ```

5. **Update src/App.tsx** (if needed)
   - Show how to import and use the new component
   - Provide example code

6. **Test Locally**
   ```bash
   npm run dev
   ```

7. **Verify Implementation**
   - Test the API endpoint
   - Test the React component
   - Check for errors in console

8. **Deploy** (when ready)
   ```bash
   npm run deploy
   ```

## Step 5: Provide Usage Examples

Show the user how to use the generated code:

### Example 1: Import and Use Component

```typescript
// In src/App.tsx
import AIChat from './components/AIChat';

function App() {
  return (
    <div>
      <h1>My App</h1>
      <AIChat />
    </div>
  );
}
```

### Example 2: Call API Directly

```typescript
// Anywhere in your React app
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello!' }),
});

const data = await response.json();
console.log(data.response);
```

### Example 3: Customize the Component

```typescript
// Pass custom props
<AIChat
  theme="dark"
  placeholder="Ask me anything..."
  maxMessages={50}
/>
```

## Step 6: Security Reminders

Always remind users about security best practices:

**Important Security Notes:**

1. **Never commit API keys** - Always use secrets
2. **Implement rate limiting** - Prevent abuse
3. **Validate all inputs** - Sanitize user input
4. **Set token limits** - Control costs
5. **Use CORS headers** - Secure your API
6. **Monitor usage** - Track costs and errors

## Step 7: Next Steps

Provide guidance on what to do next:

**Suggested Next Steps:**

1. **Add Error Handling** - Improve error messages and recovery
2. **Implement Rate Limiting** - Use KV for rate limits
3. **Add Authentication** - Protect your endpoints
4. **Enable Caching** - Use AI Gateway for caching
5. **Add Analytics** - Track usage and performance
6. **Customize UI** - Style the components to match your app
7. **Add More Features** - Extend with conversation history, etc.

**Resources:**

- See `AI_INTEGRATION.md` for detailed documentation
- Use `.claude/templates/prp_ai_feature.md` for planning complex AI features
- Check Cloudflare docs: https://developers.cloudflare.com/workers-ai/

## Execution Flow

When this command is run:

1. **Detect current state** - Check what's already configured
2. **Ask questions** - Interactive prompts for user choices
3. **Generate files** - Create/modify files based on templates
4. **Update configs** - Modify wrangler.jsonc, package.json as needed
5. **Print instructions** - Clear step-by-step setup guide
6. **Offer to continue** - Ask if user wants to add more AI features

## Error Handling

If any step fails:

1. **Explain the error** clearly
2. **Provide solution** - How to fix it
3. **Offer rollback** - Option to undo changes
4. **Continue or abort** - Let user decide next steps

## Examples of Generated Code

Show concrete examples of what will be generated for each option.

### Example: Claude API Simple Chat Worker

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();

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
        }, { headers: corsHeaders });
      } catch (error) {
        console.error('AI error:', error);
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

### Example: Workers AI Image Generation Worker

```typescript
interface Env {
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/generate-image' && request.method === 'POST') {
      try {
        const { prompt } = await request.json();

        const response = await env.AI.run(
          '@cf/stabilityai/stable-diffusion-xl-base-1.0',
          { prompt }
        );

        return new Response(response, {
          headers: {
            'Content-Type': 'image/png',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        console.error('Image generation error:', error);
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

---

**Start by asking the user which AI provider they want to use, then guide them through the rest of the setup step by step.**
