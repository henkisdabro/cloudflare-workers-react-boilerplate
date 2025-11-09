# Product Requirement Plan: Simple Claude Chat Integration

## Metadata

- **Feature**: Basic Claude API Integration (Non-Streaming)
- **Target Completion**: 2-3 hours for full implementation
- **Confidence Score**: 9/10 - Well-documented pattern with minimal dependencies
- **Created**: 2025-11-09

## Executive Summary

This feature adds a basic chat interface to the Cloudflare Workers + React application using Anthropic's Claude API. It demonstrates the simplest integration pattern with non-streaming responses, proper error handling, and TypeScript type safety. This serves as both a working example and a foundation for more advanced AI integrations.

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: API Route Handling
  - **Location**: `worker/index.ts:5-10`
  - **Description**: Existing pattern for handling API routes with URL path matching
  - **Relevance**: We'll follow the same pattern for `/api/chat` endpoint

- **Pattern**: TypeScript Configuration
  - **Location**: `tsconfig.worker.json`, `tsconfig.app.json`
  - **Description**: Dual TypeScript setup for Worker and React app
  - **Relevance**: Types need to be compatible across both environments

- **Pattern**: React Component Structure
  - **Location**: `src/App.tsx`, `src/main.tsx`
  - **Description**: React 19 with TypeScript and hooks
  - **Relevance**: Chat component follows same patterns

#### Existing Conventions

- **Convention**: TypeScript-first development
  - **Example**: All files use `.ts` or `.tsx` extensions
  - **Application**: All new code will be fully typed

- **Convention**: Environment variable handling
  - **Example**: `.env.example`, `.dev.vars` for local secrets
  - **Application**: API keys stored in `.dev.vars` locally, Cloudflare secrets in production

- **Convention**: KISS principle
  - **Example**: Simple, straightforward code throughout
  - **Application**: No over-engineering, minimal abstractions

#### Test Patterns

- **Test Framework**: None currently in project
  - **Pattern**: Manual testing via browser
  - **Location**: Testing done through `npm run dev`

### External Research

#### Documentation References

- **Resource**: Anthropic Claude API
  - **URL**: https://docs.anthropic.com/claude/reference/messages_post
  - **Key Sections**: Messages API, Non-streaming responses, Error handling
  - **Version**: Latest (claude-3-5-sonnet-20241022)
  - **Gotchas**: Requires alternating user/assistant messages, max 200k tokens context

- **Resource**: Cloudflare Workers
  - **URL**: https://developers.cloudflare.com/workers/
  - **Key Sections**: Request handling, Environment variables, Secrets
  - **Version**: Latest compatibility date
  - **Gotchas**: No Node.js built-ins, limited CPU time per request

- **Resource**: Anthropic SDK
  - **URL**: https://github.com/anthropics/anthropic-sdk-typescript
  - **Key Sections**: Installation, Basic usage, Error handling
  - **Version**: Latest (^0.27.0 or newer)
  - **Gotchas**: Polyfills needed for Workers environment (handled by SDK)

#### Implementation Examples

- **Example**: Basic Claude API Integration
  - **Source**: https://docs.anthropic.com/claude/docs/quickstart
  - **Relevance**: Shows basic message structure and API call pattern
  - **Cautions**: Example uses Node.js - adapt for Workers environment

- **Example**: React Chat UI
  - **Source**: Common React patterns
  - **Relevance**: Standard chat interface patterns
  - **Cautions**: Keep state management simple, avoid over-abstraction

#### Best Practices

- **Practice**: API Key Security
  - **Why**: Prevent unauthorized usage and cost
  - **How**: Use Cloudflare secrets, never commit keys
  - **Warning**: Never expose keys in client-side code

- **Practice**: Input Validation
  - **Why**: Prevent abuse and errors
  - **How**: Validate message length, format, and content
  - **Warning**: Don't trust user input

- **Practice**: Error Handling
  - **Why**: Graceful degradation and debugging
  - **How**: Catch errors, log details, return user-friendly messages
  - **Warning**: Don't expose internal errors to users

## Technical Specification

### Architecture Overview

```
┌─────────────────┐
│  React App      │
│  (Browser)      │
│                 │
│  ChatComponent  │
└────────┬────────┘
         │ POST /api/chat
         │ {message, history}
         ▼
┌─────────────────┐
│ Worker          │
│ /api/chat       │
│                 │
│ handleChat()    │
└────────┬────────┘
         │ API Request
         │ messages.create()
         ▼
┌─────────────────┐
│ Anthropic API   │
│                 │
│ Claude 3.5      │
└────────┬────────┘
         │ Response
         │ {message, usage}
         ▼
┌─────────────────┐
│  React App      │
│  (Display)      │
└─────────────────┘
```

### Component Breakdown

#### Component 1: Worker Endpoint

- **Purpose**: Handle chat API requests and communicate with Claude API
- **Location**: `worker/index.ts` (add handler)
- **Dependencies**: `@anthropic-ai/sdk`
- **Interface**:
  - Input: `POST /api/chat` with `ChatRequest` body
  - Output: JSON with `ChatResponse` or `ChatErrorResponse`

#### Component 2: React Chat Component

- **Purpose**: Provide user interface for chat interaction
- **Location**: `src/components/ChatComponent.tsx`
- **Dependencies**: React 19 (useState, useRef, useEffect)
- **Interface**: No props required (self-contained)

#### Component 3: Type Definitions

- **Purpose**: Ensure type safety across frontend and backend
- **Location**: `src/types/chat.ts`
- **Dependencies**: None (pure TypeScript)
- **Interface**: Exported interfaces for request/response types

### Data Models

```typescript
// Message in conversation
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  id?: string;
}

// Request to /api/chat
interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  system?: string;
}

// Success response
interface ChatResponse {
  message: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Error response
interface ChatErrorResponse {
  error: string;
  details?: string;
}
```

### API Endpoints

- **Endpoint**: `POST /api/chat`
  - **Purpose**: Send message to Claude and receive response
  - **Request**: `ChatRequest` JSON body
  - **Response**: `ChatResponse` or `ChatErrorResponse` JSON
  - **Authentication**: None (API key in Worker environment)

## Implementation Blueprint

### Prerequisites

1. Install Anthropic SDK:
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. Obtain Anthropic API key from https://console.anthropic.com/

3. Set up local development secrets:
   ```bash
   echo "ANTHROPIC_API_KEY=sk-ant-your-key" > .dev.vars
   ```

4. Set up production secret:
   ```bash
   npx wrangler secret put ANTHROPIC_API_KEY
   ```

### Implementation Steps (in order)

#### Step 1: Install Dependencies and Configure Environment

**Goal**: Set up required dependencies and API key configuration

**Files to Create/Modify**:
- `package.json` - Add @anthropic-ai/sdk dependency
- `.dev.vars` - Add ANTHROPIC_API_KEY for local development
- `.gitignore` - Ensure .dev.vars is ignored (should already be)

**Validation**:
```bash
npm list @anthropic-ai/sdk  # Should show installed version
cat .dev.vars  # Should contain API key
```

#### Step 2: Create Type Definitions

**Goal**: Define TypeScript types for type safety

**Pseudocode Approach**:
```typescript
// Define message structure
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Define request/response types
interface ChatRequest { ... }
interface ChatResponse { ... }
interface ChatErrorResponse { ... }
```

**Files to Create/Modify**:
- `src/types/chat.ts` - Create with all type definitions

**Reference Pattern**: See existing types in `src/App.tsx` for TypeScript patterns

**Validation**: TypeScript compilation should succeed

#### Step 3: Implement Worker Endpoint

**Goal**: Create API handler for chat requests

**Pseudocode Approach**:
```typescript
async function handleChat(request: Request, env: Env) {
  // 1. Validate request method
  // 2. Parse request body
  // 3. Validate input
  // 4. Initialize Anthropic client
  // 5. Build messages array
  // 6. Call Claude API
  // 7. Extract response
  // 8. Return JSON response
  // Handle errors throughout
}
```

**Files to Create/Modify**:
- `worker/index.ts` - Add handleChat function and route

**Reference Pattern**: See existing API handler in `worker/index.ts:5-10`

**Validation**:
```bash
# Test locally
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

#### Step 4: Create React Chat Component

**Goal**: Build user interface for chat interaction

**Pseudocode Approach**:
```typescript
function ChatComponent() {
  // State: messages, loading, error, input
  // Handler: sendMessage
  // Handler: clearChat
  // Effect: auto-scroll
  // Render: header, messages, input
}
```

**Files to Create/Modify**:
- `src/components/ChatComponent.tsx` - Create component

**Reference Pattern**: See React patterns in `src/App.tsx`

**Validation**: Component renders without errors in browser

#### Step 5: Integrate Component into App

**Goal**: Add chat component to main application

**Files to Create/Modify**:
- `src/App.tsx` - Import and use ChatComponent

**Validation**: Navigate to app in browser, see chat interface

#### Step 6: End-to-End Testing

**Goal**: Verify complete flow works correctly

**Manual Test Cases**:
1. Send a simple message
2. Send multiple messages (conversation)
3. Test error handling (invalid input)
4. Test loading states
5. Clear chat and start new conversation

**Validation**: All test cases pass

### Error Handling Strategy

- **Client-side errors**: Display in UI with error message component
- **Server-side errors**: Log to console, return generic error to client
- **Validation errors**: Return 400 with specific error message
- **Network errors**: Catch in component, display retry option
- **API errors**: Parse Anthropic error, return appropriate status code

### Edge Cases

1. **Edge Case**: Empty message
   - **Solution**: Disable send button when input is empty

2. **Edge Case**: Very long message (>10k characters)
   - **Solution**: Validate length in worker, return 400 error

3. **Edge Case**: API key not configured
   - **Solution**: Check env.ANTHROPIC_API_KEY, return 500 with clear error

4. **Edge Case**: Network timeout
   - **Solution**: Let fetch timeout naturally, handle error in component

5. **Edge Case**: Invalid conversation history
   - **Solution**: Validate history array format, skip invalid entries

6. **Edge Case**: Concurrent requests
   - **Solution**: Disable send button while loading

## Testing Strategy

### Unit Tests

Currently no test framework in project. For future:

- **Coverage Target**: Core functions (handleChat, sendMessage)
- **Key Test Cases**:
  - Input validation
  - Error handling
  - Message formatting
- **Mock Strategy**: Mock Anthropic API responses

### Integration Tests

- **Test Scenarios**:
  - Complete request/response flow
  - Error propagation
  - CORS headers
- **Setup Required**: Local wrangler dev server

### Manual Testing Checklist

- [ ] Send single message, receive response
- [ ] Send multiple messages, verify conversation context
- [ ] Test with empty input (should be disabled)
- [ ] Test with very long input (should error)
- [ ] Test without API key configured (should error gracefully)
- [ ] Test clear chat functionality
- [ ] Verify auto-scroll works
- [ ] Test loading states display correctly
- [ ] Test error messages display correctly
- [ ] Test in different browsers (Chrome, Firefox, Safari)

## Validation Gates

### Pre-Implementation Validation

```bash
# Ensure development environment is ready
node --version  # Should be 18+
npm --version
npx wrangler --version
```

### During Implementation Validation

```bash
# Type checking
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.worker.json

# Development server
npm run dev  # Should start without errors
```

### Post-Implementation Validation

```bash
# Build verification
npm run build  # Should complete successfully

# Lint check
npm run lint  # Should pass

# Test deployment
npm run deploy  # Should deploy successfully
```

### Manual Validation Steps

1. Start local dev server: `npm run dev`
2. Navigate to http://localhost:5173
3. Open browser console, check for errors
4. Send test message: "Hello, Claude!"
5. Verify response appears
6. Send follow-up: "What did I just say?"
7. Verify Claude references previous message
8. Test error case: Remove API key from .dev.vars, send message
9. Verify friendly error message appears
10. Restore API key, verify recovery

## Dependencies

### New Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0"
  }
}
```

**Justification**:
- `@anthropic-ai/sdk`: Official Anthropic SDK for Claude API integration
  - Handles API authentication
  - Provides TypeScript types
  - Manages request/response formatting
  - Works in Cloudflare Workers environment

### Version Compatibility

- **Node**: 18+ (for development)
- **Cloudflare Workers**: Latest compatibility date (2025-11-09)
- **React**: 19.x (already in project)
- **TypeScript**: 5.x (already in project)
- **Vite**: 6.x (already in project)

## Migration & Rollout

### Database Migrations

Not applicable - no database changes required

### Feature Flags

Not applicable - simple feature addition

### Rollout Plan

1. Develop and test locally
2. Deploy to preview environment (optional)
3. Deploy to production
4. Monitor for errors in Cloudflare dashboard
5. Track API usage in Anthropic console

## Success Criteria

- [ ] All validation gates pass
- [ ] All manual test cases pass
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Build succeeds
- [ ] Chat interface displays correctly
- [ ] Messages send and receive successfully
- [ ] Conversation context maintained
- [ ] Errors handled gracefully
- [ ] Loading states work correctly
- [ ] Clear chat functionality works
- [ ] Auto-scroll functions properly
- [ ] Works in local development
- [ ] Works in production deployment

## Known Limitations

1. **No Streaming**: Responses appear all at once, which can feel slow for long responses
   - Future: Implement streaming (see streaming-chat example)

2. **No Persistence**: Conversation history lost on page refresh
   - Future: Store in localStorage or D1 database

3. **No Authentication**: Anyone can use the chat
   - Future: Add authentication/authorization

4. **No Rate Limiting**: Potential for abuse
   - Future: Implement rate limiting with KV or Durable Objects

5. **Basic UI**: Minimal styling
   - Future: Enhanced UI with markdown rendering, code highlighting

6. **No Conversation Management**: Single conversation only
   - Future: Multiple conversations, conversation history

## References

### Internal Documentation

- Main project README: `/README.md`
- CLAUDE.md: `/CLAUDE.md`
- Worker docs: `/worker/index.ts`

### External Resources

- Anthropic API Docs: https://docs.anthropic.com/
- Anthropic SDK GitHub: https://github.com/anthropics/anthropic-sdk-typescript
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- React Documentation: https://react.dev/

## Appendix

### Code Snippets from Research

```typescript
// Example from Anthropic docs - adapted for Workers
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{ role: 'user', content: 'Hello, Claude' }],
});
```

### Additional Notes

- This example serves as foundation for more advanced features
- Keep it simple - don't add unnecessary complexity
- Document all assumptions and limitations
- Consider costs when deploying to production
- Monitor API usage to avoid unexpected bills
