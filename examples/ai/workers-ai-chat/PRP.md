# Product Requirement Plan: Workers AI Chat Integration

## Metadata

- **Feature**: Cloudflare Workers AI Integration (Edge-Native AI)
- **Target Completion**: 2-3 hours for full implementation
- **Confidence Score**: 9/10 - Simpler than external APIs, well-documented
- **Created**: 2025-11-09

## Executive Summary

This feature integrates Cloudflare Workers AI for edge-native AI inference without external API dependencies. Unlike Claude API examples, this uses Cloudflare's built-in AI binding to run models like Llama 3.1 directly at the edge. The implementation is simpler (no API keys), more cost-effective, and provides lower latency worldwide.

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: API Route Handling
  - **Location**: `examples/ai/simple-claude-chat/worker-endpoint.ts`
  - **Description**: Request validation and response handling
  - **Relevance**: Similar pattern but with Workers AI binding instead of SDK

- **Pattern**: Chat Component State Management
  - **Location**: `examples/ai/simple-claude-chat/ChatComponent.tsx`
  - **Description**: Message state, loading states, error handling
  - **Relevance**: Can reuse most of the UI logic

#### Existing Conventions

- **Convention**: Cloudflare bindings in wrangler.jsonc
  - **Example**: Assets binding already configured
  - **Application**: Add AI binding following same pattern

- **Convention**: TypeScript types from cf-typegen
  - **Example**: `worker-configuration.d.ts` generated
  - **Application**: Run cf-typegen after adding AI binding

### External Research

#### Documentation References

- **Resource**: Cloudflare Workers AI
  - **URL**: https://developers.cloudflare.com/workers-ai/
  - **Key Sections**: Getting started, Text generation, Available models
  - **Version**: Latest (2025-11-09 compatibility date)
  - **Gotchas**: Requires paid plan, response format varies by model

- **Resource**: Workers AI Bindings
  - **URL**: https://developers.cloudflare.com/workers-ai/configuration/bindings/
  - **Key Sections**: Binding configuration, TypeScript types
  - **Version**: Latest
  - **Gotchas**: Must run cf-typegen after adding binding

- **Resource**: Workers AI Models Catalog
  - **URL**: https://developers.cloudflare.com/workers-ai/models/
  - **Key Sections**: Text generation models, Model capabilities
  - **Version**: Updated regularly
  - **Gotchas**: Models have different context lengths and formats

#### Best Practices

- **Practice**: Model Selection
  - **Why**: Different models for different use cases
  - **How**: Llama 3.1 8B for quality, 3.2 1B for speed
  - **Warning**: Larger models are slower and more expensive

- **Practice**: Response Format Handling
  - **Why**: Workers AI models return different formats
  - **How**: Check for 'response', 'text', or 'content' fields
  - **Warning**: Format may change with model updates

- **Practice**: Cost Management
  - **Why**: Prevent unexpected bills
  - **How**: Monitor usage, implement rate limiting
  - **Warning**: High-volume apps can exceed included quota

## Technical Specification

### Architecture Overview

```
┌─────────────────┐
│  React Component│
│  WorkersAiChat  │
│                 │
│  - Model select │
│  - Send message │
└────────┬────────┘
         │ POST /api/ai-chat
         │ {message, model, history}
         ▼
┌─────────────────┐
│ Worker          │
│ /api/ai-chat    │
│                 │
│ - Validate      │
│ - Build messages│
│ - Call env.AI   │
└────────┬────────┘
         │ env.AI.run(model, {messages})
         ▼
┌─────────────────┐
│ Workers AI      │
│ (Edge Inference)│
│                 │
│ - Llama 3.1 8B  │
│ - Runs at edge  │
└────────┬────────┘
         │ {response: "..."}
         ▼
┌─────────────────┐
│ Worker          │
│ - Extract text  │
│ - Return JSON   │
└────────┬────────┘
         │ {message: "..."}
         ▼
┌─────────────────┐
│  React Component│
│  - Display      │
└─────────────────┘
```

### Component Breakdown

#### Component 1: Worker Endpoint with AI Binding

- **Purpose**: Handle chat requests using Workers AI
- **Location**: `worker/index.ts` (add handler)
- **Dependencies**: Workers AI binding (no npm packages)
- **Interface**:
  - Input: `POST /api/ai-chat` with `WorkersAIChatRequest`
  - Output: JSON with `WorkersAIChatResponse` or error

#### Component 2: React Chat Component with Model Selection

- **Purpose**: UI for edge AI chat with model selector
- **Location**: `src/components/WorkersAiChat.tsx`
- **Dependencies**: React 19 (useState, useRef, useEffect)
- **Interface**: No props (self-contained)

#### Component 3: Type Definitions

- **Purpose**: Types for Workers AI models and responses
- **Location**: `src/types/workers-ai-chat.ts`
- **Dependencies**: None
- **Interface**: Model enums, request/response types

### Data Models

```typescript
// Workers AI message format
interface WorkersAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Request with model selection
interface WorkersAIChatRequest {
  message: string;
  conversationHistory?: Array<{role, content}>;
  model?: WorkersAIModel;
  system?: string;
}

// Response (simpler than Claude)
interface WorkersAIChatResponse {
  message: string;
  model: string;
}
```

### API Endpoints

- **Endpoint**: `POST /api/ai-chat`
  - **Purpose**: Generate AI response using Workers AI
  - **Request**: `WorkersAIChatRequest` JSON body
  - **Response**: `WorkersAIChatResponse` JSON
  - **Authentication**: None (uses Workers AI binding)

## Implementation Blueprint

### Prerequisites

1. **Cloudflare Workers Paid Plan**: $5/month (required for Workers AI)

2. **No Dependencies to Install**: Workers AI is built-in!

3. **Wrangler CLI**: Should already be installed

### Implementation Steps (in order)

#### Step 1: Add AI Binding to wrangler.jsonc

**Goal**: Configure Workers AI binding

**Files to Modify**:
- `wrangler.jsonc` - Add AI binding

```jsonc
{
  // ... existing config ...
  "ai": {
    "binding": "AI"
  }
}
```

**Validation**: File saves without errors

#### Step 2: Generate TypeScript Types

**Goal**: Get proper types for AI binding

**Commands**:
```bash
npm run cf-typegen
```

**Files Modified**:
- `worker-configuration.d.ts` - Now includes AI binding types

**Validation**: TypeScript compilation succeeds, `env.AI` is typed

#### Step 3: Create Type Definitions

**Goal**: Define types for models and requests

**Files to Create**:
- `src/types/workers-ai-chat.ts`

**Reference Pattern**: Extend from `examples/ai/simple-claude-chat/types.ts`

**Validation**: TypeScript compilation succeeds

#### Step 4: Implement Worker Endpoint

**Goal**: Create handler using env.AI binding

**Pseudocode**:
```typescript
async function handleWorkersAIChat(request, env) {
  // 1. Validate input
  // 2. Build messages array
  // 3. Call env.AI.run(model, {messages})
  // 4. Extract response (handle different formats)
  // 5. Return JSON
}
```

**Key Code**:
```typescript
const aiResponse = await env.AI.run(
  '@cf/meta/llama-3.1-8b-instruct',
  { messages }
);

// Extract text from response
const text = aiResponse.response || aiResponse.text || aiResponse.content;
```

**Files to Modify**:
- `worker/index.ts` - Add handler

**Validation**:
```bash
npx wrangler dev
curl -X POST http://localhost:8787/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello!"}'
```

#### Step 5: Create React Component

**Goal**: Build UI with model selection

**Pseudocode**:
```typescript
function WorkersAiChat() {
  // State: messages, isLoading, selectedModel
  // Model selector UI
  // Handler: sendMessage (with selected model)
  // Handler: changeModel
}
```

**Files to Create**:
- `src/components/WorkersAiChat.tsx`

**Reference Pattern**: Based on `examples/ai/simple-claude-chat/ChatComponent.tsx`

**Validation**: Component renders, model selector works

#### Step 6: Integrate Component

**Goal**: Add to main app

**Files to Modify**:
- `src/App.tsx` - Import and use component

**Validation**: Component appears in app, can send messages

#### Step 7: Test Multiple Models

**Goal**: Verify all models work

**Test Cases**:
- Llama 3.1 8B (best quality)
- Llama 3.2 1B (fastest)
- Mistral 7B (alternative)

**Validation**: All models return responses

### Error Handling Strategy

- **Binding Not Found**: Check env.AI exists, return helpful error
- **Model Not Available**: Catch and return model-specific error
- **Rate Limit Errors**: Detect and return 429 status
- **Quota Exceeded**: Detect and inform user
- **Invalid Input**: Same validation as other chat examples

### Edge Cases

1. **Edge Case**: AI binding not configured
   - **Solution**: Check env.AI, return 500 with setup instructions

2. **Edge Case**: Model returns unexpected format
   - **Solution**: Try multiple field names (response, text, content)

3. **Edge Case**: Empty response from AI
   - **Solution**: Validate response, return error if empty

4. **Edge Case**: Very long context
   - **Solution**: Truncate history to fit model's context window

5. **Edge Case**: User on free plan
   - **Solution**: API will return error, catch and display upgrade message

## Testing Strategy

### Manual Testing Checklist

- [ ] Send message with default model (Llama 3.1 8B)
- [ ] Change to different model (Llama 3.2 1B)
- [ ] Send multiple messages (conversation context)
- [ ] Test with very long message
- [ ] Test error handling (invalid input)
- [ ] Verify model selector UI
- [ ] Test clear chat functionality
- [ ] Check auto-scroll
- [ ] Test on production deployment
- [ ] Monitor costs in Cloudflare dashboard

## Validation Gates

### Pre-Implementation

```bash
# Check Workers plan (must be paid)
# Check in Cloudflare dashboard: dash.cloudflare.com
```

### During Implementation

```bash
# Type checking
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.worker.json

# Dev with wrangler (uses remote AI)
npx wrangler dev
```

### Post-Implementation

```bash
# Build
npm run build

# Deploy
npm run deploy

# Test production
curl -X POST https://your-worker.workers.dev/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from production!"}'
```

## Dependencies

### No npm Dependencies Required!

Workers AI is built into Cloudflare - no packages to install.

### Platform Requirements

- Cloudflare Workers Paid plan ($5/month)
- Workers AI enabled (automatic with paid plan)

## Success Criteria

- [ ] AI binding configured in wrangler.jsonc
- [ ] Types generated with cf-typegen
- [ ] Worker endpoint handles requests
- [ ] Multiple models available
- [ ] Model selector UI works
- [ ] Responses display correctly
- [ ] Error handling functional
- [ ] Works in local dev (wrangler dev)
- [ ] Works in production
- [ ] Costs within expected range

## Known Limitations

1. **Requires Paid Plan**: $5/month minimum
   - Not available on free tier

2. **Model Quality**: Good but not GPT-4/Claude level
   - Trade-off for cost and latency

3. **Context Length**: 8k tokens max (vs 200k for Claude)
   - Limited conversation history

4. **Local Development**: Uses remote AI even in local dev
   - Requires internet connection

5. **Response Format**: Varies by model
   - Need flexible parsing logic

## References

### External Resources

- Workers AI Docs: https://developers.cloudflare.com/workers-ai/
- Model Catalog: https://developers.cloudflare.com/workers-ai/models/
- Pricing: https://developers.cloudflare.com/workers-ai/platform/pricing/
- Bindings: https://developers.cloudflare.com/workers-ai/configuration/bindings/

## Appendix

### Available Models Quick Reference

```typescript
// Best quality
'@cf/meta/llama-3.1-8b-instruct'

// Fastest
'@cf/meta/llama-3.2-1b-instruct'

// Balanced
'@cf/meta/llama-3.2-3b-instruct'

// Alternative
'@cf/mistral/mistral-7b-instruct-v0.1'

// Largest (best quality, slowest)
'@cf/qwen/qwen1.5-14b-chat-awq'
```

### Cost Calculation

Neurons per request (approximate):
- Llama 3.1 8B: ~100 neurons
- Llama 3.2 1B: ~50 neurons

Included: 10M neurons/month ($5 plan)
Additional: $0.011 per 1,000 neurons

Example: 100,000 requests/month with Llama 3.1 8B
= 100,000 * 100 = 10M neurons (included in $5 plan)

### Troubleshooting

**"AI binding not found"**
1. Add to wrangler.jsonc: `"ai": {"binding": "AI"}`
2. Run: `npm run cf-typegen`
3. Restart dev server

**"Requires paid plan"**
1. Upgrade at dash.cloudflare.com
2. Enable Workers AI in dashboard
3. Redeploy worker

**Slow responses**
1. Use Llama 3.2 1B instead of 3.1 8B
2. Reduce conversation history length
3. Check Cloudflare dashboard for rate limiting
