# Product Requirement Plan: AI Feature - [Feature Name]

## Metadata

- **Feature**: [AI feature name - e.g., "Claude-powered chat assistant"]
- **AI Provider**: [Claude API / Workers AI / AI Gateway]
- **Target Completion**: [Timeline estimate]
- **Confidence Score**: [1-10] - Likelihood of one-pass implementation success
- **Created**: [Date]

## Executive Summary

[2-3 sentences describing what this AI feature does and why it's valuable]

**Example:** This feature adds an AI-powered chat assistant to the application using Claude API. Users can have natural conversations with the AI to get help, answer questions, or complete tasks. The implementation uses streaming responses for real-time feedback and includes proper error handling and rate limiting.

## Research Findings

### AI-Specific Considerations

#### Model Selection

**Chosen Model**: [Model name and version]

**Rationale**:
- **Task Complexity**: [Simple/Medium/Complex - justify choice]
- **Latency Requirements**: [Real-time vs batch acceptable]
- **Cost Constraints**: [Budget per request/month]
- **Quality Requirements**: [Acceptable vs high-quality responses]

**Alternatives Considered**:
| Model | Pros | Cons | Cost | Decision |
|-------|------|------|------|----------|
| claude-sonnet-4-5 | High quality, fast | Higher cost | $3/$15 per 1M tokens | ✅ Chosen |
| claude-haiku-3-5 | Very fast, cheap | Lower quality | $0.80/$4 per 1M tokens | ❌ Too simple |
| Workers AI Llama | Free tier, fast | Limited capability | Free/very cheap | ❌ Insufficient for task |

#### Token Usage Estimation

**Input Tokens per Request**:
- System prompt: [X tokens]
- User message (avg): [Y tokens]
- Conversation history (avg): [Z tokens]
- Total input: [X+Y+Z tokens]

**Output Tokens per Request**:
- Expected response length: [A tokens]
- Max tokens limit: [B tokens]

**Cost per Request**:
```
Input cost = (X+Y+Z) * $price_per_1M / 1,000,000
Output cost = A * $price_per_1M / 1,000,000
Total = Input cost + Output cost
```

**Monthly Volume Estimate**:
- Expected requests/day: [Number]
- Expected requests/month: [Number * 30]
- **Estimated monthly cost**: $[Total]

#### Rate Limiting Strategy

**Limits to Implement**:
- Per IP: [N requests per hour/day]
- Per user (if authenticated): [M requests per hour/day]
- Global: [P requests per minute]

**Implementation**:
- **Storage**: Cloudflare KV for rate limit counters
- **Key format**: `rate_limit:{ip}:{hour}` or `rate_limit:{user_id}:{hour}`
- **TTL**: Automatic expiration based on time window

**Cost Protection**:
- Hard limit on max_tokens: [Number]
- Circuit breaker at: $[Amount] per day/month
- Alert threshold at: $[Amount] per day/month

### Codebase Analysis

#### Similar Patterns Found

[List similar features or patterns discovered in the codebase]

- **Pattern**: [Existing API endpoint pattern]
  - **Location**: `worker/index.ts:5-12`
  - **Description**: Current request routing pattern
  - **Relevance**: Will follow same pattern for AI endpoints

- **Pattern**: [Existing React component patterns]
  - **Location**: `src/components/`
  - **Description**: Component structure and styling approach
  - **Relevance**: AI chat component will match existing patterns

#### Existing Conventions

[List coding conventions to follow]

- **Convention**: TypeScript strict mode
  - **Example**: All types must be explicitly defined
  - **Application**: Define interfaces for all AI request/response types

- **Convention**: Error handling
  - **Example**: Try-catch blocks with specific error types
  - **Application**: Handle Anthropic API errors specifically

- **Convention**: Environment variables
  - **Example**: Use `env.VARIABLE_NAME` in worker
  - **Application**: Store ANTHROPIC_API_KEY in Cloudflare secrets

#### Test Patterns

[Document testing approach for AI features]

- **Test Framework**: [Framework if exists, or manual testing]
- **Pattern**: Manual testing with npm run dev
- **Validation**:
  - Test with various input lengths
  - Test error scenarios (invalid key, rate limits)
  - Test streaming behavior
  - Test conversation history

### External Research

#### Documentation References

**Anthropic API Documentation**:
- **URL**: https://docs.anthropic.com/en/api/messages
- **Key Sections**: Messages API, Streaming, Error Handling
- **Version**: Latest (2025)
- **Gotchas**:
  - Content is an array, need to find text type
  - Rate limits vary by tier
  - Streaming uses async iterators

**Cloudflare Workers AI**:
- **URL**: https://developers.cloudflare.com/workers-ai/
- **Key Sections**: Models, Bindings, AI Gateway
- **Version**: Latest (2025)
- **Gotchas**:
  - Model names include @cf/ prefix
  - Free tier has limits
  - Some models in beta

**AI Gateway Documentation**:
- **URL**: https://developers.cloudflare.com/ai-gateway/
- **Key Sections**: Configuration, Caching, Analytics
- **Version**: Latest (2025)
- **Gotchas**:
  - Caching requires careful key design
  - Different providers have different formats

#### Implementation Examples

**Anthropic SDK TypeScript Examples**:
- **Source**: https://github.com/anthropics/anthropic-sdk-typescript
- **Relevance**: Official SDK patterns for streaming and messages
- **Key Learnings**: Async iterator pattern for streaming

**Cloudflare Workers AI Examples**:
- **Source**: https://developers.cloudflare.com/workers-ai/examples/
- **Relevance**: Workers AI binding usage patterns
- **Key Learnings**: Simple binding access, no auth needed

#### Best Practices

**Prompt Engineering**:
- **Practice**: Use system prompts for consistent behavior
- **Why**: Better control over AI responses
- **How**: Add system parameter to messages.create()
- **Warning**: System prompts count toward input tokens

**Streaming Responses**:
- **Practice**: Always use streaming for user-facing chat
- **Why**: Better perceived performance and UX
- **How**: Use anthropic.messages.stream() and SSE
- **Warning**: More complex error handling needed

**Error Handling**:
- **Practice**: Catch and handle Anthropic.APIError specifically
- **Why**: Different status codes need different handling
- **How**: Check error.status and map to user messages
- **Warning**: Don't expose internal errors to users

**Cost Control**:
- **Practice**: Set max_tokens limit on all requests
- **Why**: Prevent runaway costs from long responses
- **How**: Add max_tokens parameter (e.g., 2048)
- **Warning**: Too low limit truncates responses

## Technical Specification

### Architecture Overview

```
┌─────────────┐         ┌─────────────────┐         ┌──────────────┐
│   React     │ POST    │  Cloudflare     │  API    │   Claude     │
│   Chat UI   │────────▶│    Worker       │────────▶│   API        │
│             │◀────────│  /api/chat      │◀────────│              │
└─────────────┘  JSON   └─────────────────┘  Stream └──────────────┘
                                │
                                │ Store rate limits
                                ▼
                        ┌─────────────────┐
                        │ Cloudflare KV   │
                        │ (Rate Limiting) │
                        └─────────────────┘
```

**Optional: AI Gateway Layer**

```
┌─────────────┐         ┌─────────────────┐         ┌──────────────┐         ┌──────────────┐
│   React     │         │  Cloudflare     │         │ AI Gateway   │         │   Claude     │
│   Chat UI   │────────▶│    Worker       │────────▶│  (Caching)   │────────▶│   API        │
└─────────────┘         └─────────────────┘         └──────────────┘         └──────────────┘
```

### Component Breakdown

#### Component 1: React Chat Component

- **Purpose**: User interface for AI chat interactions
- **Location**: `src/components/AIChat.tsx`
- **Dependencies**: None (pure React)
- **Interface**:
  ```typescript
  interface AIChatProps {
    apiEndpoint?: string;
    placeholder?: string;
    maxMessages?: number;
  }
  ```

#### Component 2: Worker API Endpoint

- **Purpose**: Handle AI API requests, manage rate limiting
- **Location**: `worker/index.ts`
- **Dependencies**: @anthropic-ai/sdk
- **Interface**:
  ```typescript
  POST /api/chat
  Request: { message: string, conversationHistory?: Message[] }
  Response: { success: boolean, response?: string, error?: string }
  ```

#### Component 3: Rate Limiting Service (Optional)

- **Purpose**: Track and enforce rate limits per IP/user
- **Location**: `worker/index.ts` (inline)
- **Dependencies**: Cloudflare KV binding
- **Interface**: Internal functions for checkRateLimit()

### Data Models

```typescript
// Chat message structure
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

// API request format
interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

// API response format
interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

// Worker environment bindings
interface Env {
  ANTHROPIC_API_KEY: string;
  AI_GATEWAY_ID?: string;
  AI_GATEWAY_ACCOUNT?: string;
  RATE_LIMIT_KV?: KVNamespace;
}
```

### API Endpoints

#### POST /api/chat

- **Purpose**: Send message to AI and get response
- **Request**:
  ```json
  {
    "message": "Hello, how are you?",
    "conversationHistory": [
      { "role": "user", "content": "Hi" },
      { "role": "assistant", "content": "Hello!" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "response": "I'm doing well, thank you for asking!",
    "usage": {
      "inputTokens": 25,
      "outputTokens": 12
    }
  }
  ```
- **Error Response**:
  ```json
  {
    "success": false,
    "error": "Rate limit exceeded"
  }
  ```
- **Authentication**: None (can add later)
- **Rate Limit**: [N] requests per hour per IP

#### POST /api/chat-stream (if streaming)

- **Purpose**: Stream AI responses in real-time
- **Request**: Same as /api/chat
- **Response**: Server-sent events (SSE)
  ```
  data: {"text":"Hello"}
  data: {"text":" there"}
  data: [DONE]
  ```

## Implementation Blueprint

### Prerequisites

1. **Install Anthropic SDK**:
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. **Get Anthropic API Key**:
   - Sign up at https://console.anthropic.com/
   - Create API key
   - Store in Cloudflare secrets:
     ```bash
     npx wrangler secret put ANTHROPIC_API_KEY
     ```
   - For local dev:
     ```bash
     echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
     ```

3. **(Optional) Create AI Gateway**:
   - Log in to Cloudflare dashboard
   - Navigate to AI > AI Gateway
   - Create new gateway
   - Note gateway ID and account ID

4. **(Optional) Create KV Namespace for Rate Limiting**:
   ```bash
   npx wrangler kv:namespace create RATE_LIMIT_KV
   ```
   - Add binding to wrangler.jsonc

### Implementation Steps (in order)

#### Step 1: Update Worker with AI Endpoint

**Goal**: Add /api/chat endpoint that calls Claude API

**Pseudocode Approach**:
```typescript
// In worker/index.ts
if (url.pathname === '/api/chat') {
  // 1. Parse and validate request
  // 2. Check rate limit (optional)
  // 3. Call Anthropic API with message + history
  // 4. Return response with usage stats
  // 5. Handle errors appropriately
}
```

**Files to Create/Modify**:
- `worker/index.ts` - Add chat endpoint handler
- Use template: `.claude/templates/ai-worker-claude-api.ts`

**Reference Pattern**: See `.claude/templates/ai-worker-claude-api.ts` for complete implementation

**Validation**:
```bash
# Test locally
npm run dev

# Test endpoint
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'
```

#### Step 2: Create React Chat Component

**Goal**: Build UI for chat interactions

**Pseudocode Approach**:
```typescript
// In src/components/AIChat.tsx
function AIChat() {
  // 1. State for messages, input, loading, error
  // 2. sendMessage function that calls /api/chat
  // 3. Display messages in scrollable container
  // 4. Input field with send button
  // 5. Error display
  // 6. Loading state
}
```

**Files to Create/Modify**:
- `src/components/AIChat.tsx` - Create new component
- Use template: `.claude/templates/ai-chat-component.tsx`

**Reference Pattern**: See `.claude/templates/ai-chat-component.tsx` for complete implementation

**Validation**:
```bash
# Import in App.tsx and test in browser
npm run dev
# Open http://localhost:5173
# Test chat functionality
```

#### Step 3: Create TypeScript Types

**Goal**: Define shared types for type safety

**Files to Create/Modify**:
- `src/types/ai.ts` - Create types file

**Code**:
```typescript
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
```

**Validation**:
```bash
npx tsc --noEmit
```

#### Step 4: Update wrangler.jsonc (if using AI Gateway or KV)

**Goal**: Configure Cloudflare bindings

**Files to Create/Modify**:
- `wrangler.jsonc` - Add vars and bindings

**Code**:
```jsonc
{
  "name": "your-app",
  // ... existing config
  "vars": {
    "AI_GATEWAY_ID": "your-gateway-id",
    "AI_GATEWAY_ACCOUNT": "your-account-id"
  },
  "kv_namespaces": [
    {
      "binding": "RATE_LIMIT_KV",
      "id": "your-kv-namespace-id"
    }
  ]
}
```

**Validation**:
```bash
npm run cf-typegen
# Check worker-configuration.d.ts for new bindings
```

#### Step 5: Add Rate Limiting (Optional)

**Goal**: Prevent abuse and control costs

**Pseudocode Approach**:
```typescript
async function checkRateLimit(request, env) {
  // 1. Get IP from request
  // 2. Check KV for current count
  // 3. If over limit, return false
  // 4. Increment counter with TTL
  // 5. Return true
}
```

**Files to Create/Modify**:
- `worker/index.ts` - Add rate limiting logic

**Code**:
```typescript
async function checkRateLimit(request: Request, env: Env): Promise<boolean> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate_limit:${ip}`;
  const current = await env.RATE_LIMIT_KV.get(key);
  const count = current ? parseInt(current) : 0;

  if (count >= 10) return false; // 10 requests per hour

  await env.RATE_LIMIT_KV.put(key, String(count + 1), {
    expirationTtl: 3600, // 1 hour
  });

  return true;
}
```

**Validation**: Test with multiple rapid requests

#### Step 6: Integrate Component into App

**Goal**: Make chat accessible in the UI

**Files to Create/Modify**:
- `src/App.tsx` - Import and use AIChat

**Code**:
```typescript
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

**Validation**: Visual check in browser

### Error Handling Strategy

**Client-side errors**:
- Network failures: Display retry button
- Invalid input: Show validation message
- Rate limit: Show "try again later" message

**Server-side errors**:
- API authentication: Log error, return generic message
- API rate limit: Return 429 with retry-after
- Invalid request: Return 400 with specific message
- API unavailable: Return 503 with "try again later"

**Validation errors**:
- Empty message: Prevent send button
- Message too long: Show character count and limit
- Invalid history: Sanitize or reject request

**Network errors**:
- Timeout: Show timeout message with retry
- Connection lost: Show connection error
- CORS issues: Check CORS headers in worker

### Edge Cases

1. **Edge Case**: Very long messages (>10000 chars)
   - **Solution**: Truncate or reject with error message

2. **Edge Case**: Rapid repeated messages
   - **Solution**: Debounce send button or rate limit

3. **Edge Case**: Lost connection during streaming
   - **Solution**: Detect stream end, show retry option

4. **Edge Case**: API key invalid or expired
   - **Solution**: Log error, show generic error to user

5. **Edge Case**: Empty conversation history
   - **Solution**: Handle gracefully, send only new message

## Testing Strategy

### Unit Tests

**Coverage Target**: Key functions (validation, rate limiting)

**Key Test Cases**:
- validateChatRequest() with valid/invalid input
- Rate limiting counter increment
- Error response formatting

**Mock Strategy**: Mock Anthropic SDK and KV

### Integration Tests

**Test Scenarios**:
- End-to-end chat flow (send message, receive response)
- Rate limiting enforcement
- Error handling for API failures
- Streaming response handling

**Setup Required**: Test environment with mock API key

### Manual Testing Checklist

- [ ] Send simple message and get response
- [ ] Send message with conversation history
- [ ] Verify streaming works (if implemented)
- [ ] Test with very long message (should reject)
- [ ] Test with empty message (should reject)
- [ ] Trigger rate limit (send many requests)
- [ ] Test with invalid API key (should error gracefully)
- [ ] Check CORS from frontend
- [ ] Verify token usage logging
- [ ] Test error recovery (retry after error)

## Validation Gates

### Pre-Implementation Validation

```bash
# Ensure API key is set
npx wrangler secret list | grep ANTHROPIC_API_KEY

# Ensure dependencies installed
npm list @anthropic-ai/sdk

# Check TypeScript config
cat tsconfig.worker.json
```

### During Implementation Validation

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Test locally
npm run dev
# Then test endpoint manually or with curl
```

### Post-Implementation Validation

```bash
# Full build
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Preview production build
npm run preview

# Test in browser
# - Send multiple messages
# - Check console for errors
# - Verify network requests
```

### Manual Validation Steps

1. Test chat functionality in browser
2. Verify streaming works smoothly
3. Check error messages display correctly
4. Test rate limiting by sending many requests
5. Verify token usage is logged
6. Check mobile responsiveness

## Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0"
  }
}
```

**Justification**:
- `@anthropic-ai/sdk`: Official TypeScript SDK for Claude API, provides type-safe interface and streaming support

### Version Compatibility

- **Node**: >=18.0.0 (already required by Vite)
- **TypeScript**: >=5.0.0 (already in project)
- **Anthropic SDK**: Latest stable version

## Migration & Rollout

### Database Migrations (if applicable)

N/A - No database changes required

### Feature Flags (if applicable)

Optional: Add environment variable to enable/disable AI features:

```jsonc
// wrangler.jsonc
{
  "vars": {
    "AI_ENABLED": "true"
  }
}
```

### Rollout Plan

1. **Development**: Test locally with `npm run dev`
2. **Staging**: Deploy to staging environment (if exists)
3. **Production**: Deploy to production with `npm run deploy`
4. **Monitor**: Watch logs and usage for first 24 hours
5. **Iterate**: Adjust rate limits and costs based on usage

## Success Criteria

- [ ] All validation gates pass
- [ ] Chat endpoint returns valid responses
- [ ] React component displays messages correctly
- [ ] Streaming works smoothly (if implemented)
- [ ] Rate limiting prevents abuse
- [ ] Error handling works for all error types
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] CORS headers work from frontend
- [ ] Token usage is logged
- [ ] Cost per request is within budget
- [ ] Latency is acceptable (<2s for simple queries)

## Known Limitations

**Current limitations**:
- No authentication (anyone can use the API)
- No conversation persistence (history in memory only)
- Rate limiting by IP only (can be bypassed)
- No cost monitoring dashboard

**Future enhancements**:
- Add user authentication
- Store conversations in D1/KV
- Add usage analytics dashboard
- Implement semantic caching
- Add conversation export
- Support file uploads (when Claude supports it)

## References

### Internal Documentation

- AI_INTEGRATION.md - Full AI integration guide
- .claude/templates/ai-worker-claude-api.ts - Worker template
- .claude/templates/ai-chat-component.tsx - React component template

### External Resources

- Anthropic API Docs: https://docs.anthropic.com/
- Anthropic SDK: https://github.com/anthropics/anthropic-sdk-typescript
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/
- AI Gateway: https://developers.cloudflare.com/ai-gateway/
- Model Pricing: https://www.anthropic.com/pricing

## Appendix

### Code Snippets from Research

**Example: Streaming with Anthropic SDK**

```typescript
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-5-20250929',
  max_tokens: 2048,
  messages: [{ role: 'user', content: 'Hello!' }],
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
    console.log(chunk.delta.text);
  }
}
```

**Example: Rate Limiting with KV**

```typescript
const key = `rate_limit:${ip}`;
const current = await env.KV.get(key);
const count = current ? parseInt(current) : 0;

if (count >= LIMIT) {
  return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
}

await env.KV.put(key, String(count + 1), { expirationTtl: 3600 });
```

### Additional Notes

- Consider using AI Gateway for caching to reduce costs (90% savings possible)
- Monitor token usage closely in first week to adjust limits
- Consider adding system prompt for consistent AI behavior
- Test thoroughly with various message types before production
