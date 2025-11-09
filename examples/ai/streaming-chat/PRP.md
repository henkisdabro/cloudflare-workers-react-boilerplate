# Product Requirement Plan: Streaming Chat Integration

## Metadata

- **Feature**: Streaming Chat with Server-Sent Events (SSE)
- **Target Completion**: 3-4 hours for full implementation
- **Confidence Score**: 8/10 - More complex than simple chat but well-documented
- **Created**: 2025-11-09

## Executive Summary

This feature implements real-time streaming chat using Claude API with Server-Sent Events (SSE). Unlike the simple chat example, this provides character-by-character streaming for better user experience, especially with long-form responses. The implementation includes proper stream management, error handling, and the ability to cancel streaming mid-response.

## Research Findings

### Codebase Analysis

#### Similar Patterns Found

- **Pattern**: Basic API Route Handling
  - **Location**: `worker/index.ts:5-10` and `examples/ai/simple-claude-chat/worker-endpoint.ts`
  - **Description**: Existing pattern for handling API routes
  - **Relevance**: Will extend for streaming responses

- **Pattern**: React State Management
  - **Location**: `examples/ai/simple-claude-chat/ChatComponent.tsx`
  - **Description**: useState hooks for managing chat state
  - **Relevance**: Similar pattern but with streaming state

#### Existing Conventions

- **Convention**: TypeScript-first development
  - **Example**: All files use `.ts` or `.tsx` extensions
  - **Application**: All streaming code will be fully typed

- **Convention**: KISS and YAGNI principles
  - **Example**: Simple, straightforward implementations throughout
  - **Application**: Keep streaming logic simple, avoid over-engineering

### External Research

#### Documentation References

- **Resource**: Anthropic Streaming API
  - **URL**: https://docs.anthropic.com/claude/reference/messages-streaming
  - **Key Sections**: Streaming responses, Event types, Error handling
  - **Version**: Latest (supports all Claude 3+ models)
  - **Gotchas**: Must iterate over stream events, different event types have different structures

- **Resource**: Server-Sent Events (SSE) Specification
  - **URL**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
  - **Key Sections**: EventSource API, Message format, Connection management
  - **Version**: Standard web API
  - **Gotchas**: Must use specific format (data: prefix, double newline), browser compatibility

- **Resource**: Cloudflare Workers Streaming
  - **URL**: https://developers.cloudflare.com/workers/examples/streaming/
  - **Key Sections**: TransformStream, ReadableStream, Response streaming
  - **Version**: Current Workers runtime
  - **Gotchas**: Different from Node.js streams, limited to Workers API

#### Best Practices

- **Practice**: Proper Stream Cleanup
  - **Why**: Prevent memory leaks and hanging connections
  - **How**: Always close writers, release readers, abort on unmount
  - **Warning**: Unclosed streams consume resources

- **Practice**: SSE Format Compliance
  - **Why**: Browsers require exact format for parsing
  - **How**: Use `data: {json}\n\n` format (double newline required)
  - **Warning**: Missing newlines cause parsing failures

- **Practice**: Error Handling in Streams
  - **Why**: Streams can fail mid-response
  - **How**: Wrap in try-catch, send error events, close gracefully
  - **Warning**: Don't leave clients hanging

## Technical Specification

### Architecture Overview

```
┌─────────────────┐
│  React Component│
│  StreamingChat  │
│                 │
│  - useState     │
│  - useRef       │
│  - useEffect    │
└────────┬────────┘
         │ POST /api/chat-stream
         │ fetch with body
         ▼
┌─────────────────┐
│ Worker          │
│ /api/chat-stream│
│                 │
│ - Validate      │
│ - Create stream │
│ - Send SSE      │
└────────┬────────┘
         │ Stream API call
         │ messages.create({stream:true})
         ▼
┌─────────────────┐
│ Anthropic API   │
│                 │
│ - Stream events │
│ - content_delta │
│ - message_stop  │
└────────┬────────┘
         │ SSE Stream
         │ data: {type:"content",...}
         │ data: {type:"content",...}
         │ data: {type:"done",...}
         ▼
┌─────────────────┐
│  React Component│
│  - Read stream  │
│  - Parse events │
│  - Update UI    │
└─────────────────┘
```

### Component Breakdown

#### Component 1: Worker Streaming Endpoint

- **Purpose**: Stream Claude API responses using SSE format
- **Location**: `worker/index.ts` (add handler)
- **Dependencies**: `@anthropic-ai/sdk`
- **Interface**:
  - Input: `POST /api/chat-stream` with `StreamingChatRequest` body
  - Output: SSE stream with `content`, `done`, and `error` events

#### Component 2: React Streaming Component

- **Purpose**: Display streaming responses in real-time
- **Location**: `src/components/StreamingChat.tsx`
- **Dependencies**: React 19 (useState, useRef, useEffect)
- **Interface**: No props (self-contained)

#### Component 3: Type Definitions

- **Purpose**: Type safety for streaming events and state
- **Location**: `src/types/streaming-chat.ts`
- **Dependencies**: None (pure TypeScript)
- **Interface**: StreamEvent types, SSE state types

### Data Models

```typescript
// Streaming-specific message
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  id?: string;
  isStreaming?: boolean; // New: indicates active stream
}

// SSE event types
type StreamEvent =
  | { type: 'content'; text: string }
  | { type: 'done'; model: string; usage?: {...} }
  | { type: 'error'; error: string };

// Streaming state
interface StreamingChatUIState {
  isStreaming: boolean;
  streamingContent: string; // Accumulates during stream
  // ... other fields
}
```

### API Endpoints

- **Endpoint**: `POST /api/chat-stream`
  - **Purpose**: Stream Claude responses in real-time
  - **Request**: `StreamingChatRequest` JSON body
  - **Response**: SSE stream with events
  - **Format**: `data: {json}\n\n` for each event

## Implementation Blueprint

### Prerequisites

1. Install Anthropic SDK (if not already):
   ```bash
   npm install @anthropic-ai/sdk
   ```

2. API key must be configured (from simple-claude-chat example)

3. Understanding of async iterators and streams

### Implementation Steps (in order)

#### Step 1: Create Streaming Type Definitions

**Goal**: Define types for streaming events and state

**Files to Create**:
- `src/types/streaming-chat.ts` - All streaming types

**Reference Pattern**: Extend types from `examples/ai/simple-claude-chat/types.ts`

**Validation**: TypeScript compilation succeeds

#### Step 2: Implement Worker Streaming Endpoint

**Goal**: Create SSE streaming handler

**Pseudocode Approach**:
```typescript
async function handleStreamingChat(request, env) {
  // 1. Validate input (reuse from simple chat)
  // 2. Create TransformStream for SSE
  // 3. Get writer and encoder
  // 4. Start Claude streaming in background
  // 5. Process stream events:
  //    - content_block_delta -> send content event
  //    - message_stop -> send done event
  //    - errors -> send error event
  // 6. Return Response with readable stream
}
```

**Files to Create**:
- Add `handleStreamingChat` function to `worker/index.ts`

**Reference Pattern**: See `examples/ai/simple-claude-chat/worker-endpoint.ts` for validation logic

**Validation**:
```bash
# Test with curl
curl -N -X POST http://localhost:8787/api/chat-stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Count to 10"}'
```

#### Step 3: Create Streaming React Component

**Goal**: Build UI that processes SSE stream

**Pseudocode Approach**:
```typescript
function StreamingChat() {
  // State: messages, isStreaming, streamingContent
  // Ref: abortController for cancellation
  // Handler: sendMessage
  //   - Add user message
  //   - Fetch /api/chat-stream
  //   - Read stream with reader.read()
  //   - Parse SSE format ("data: {json}\n\n")
  //   - Update streamingContent on content events
  //   - Add message on done event
  // Handler: stopStream (abort controller)
  // Effect: cleanup on unmount
}
```

**Files to Create**:
- `src/components/StreamingChat.tsx`

**Reference Pattern**: Extend `examples/ai/simple-claude-chat/ChatComponent.tsx`

**Validation**: Component renders and handles streaming

#### Step 4: Implement Stream Processing Logic

**Goal**: Correctly parse SSE events from stream

**Key Logic**:
```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const events = buffer.split('\n\n');
  buffer = events.pop() || ''; // Keep incomplete event

  for (const event of events) {
    if (event.startsWith('data: ')) {
      const data = JSON.parse(event.slice(6));
      // Handle data.type === 'content' | 'done' | 'error'
    }
  }
}
```

**Validation**: Streaming displays correctly, no dropped characters

#### Step 5: Add Stop/Cancel Functionality

**Goal**: Allow users to stop streaming mid-response

**Implementation**:
- Use AbortController with fetch
- Add "Stop" button during streaming
- Clean up state on abort

**Validation**: Stop button cancels stream cleanly

#### Step 6: Add Auto-Scroll and Visual Indicators

**Goal**: UX polish for streaming

**Implementation**:
- useRef for scroll container
- useEffect to scroll on content change
- Blinking cursor during streaming
- Loading states

**Validation**: Auto-scrolls smoothly, cursor visible during streaming

### Error Handling Strategy

- **Stream Connection Errors**: Catch fetch errors, display to user, allow retry
- **Parse Errors**: Log SSE parse failures, continue processing other events
- **API Errors**: Send error events in stream, display in UI
- **Abort Errors**: Handle gracefully (user-initiated, not an error)
- **Network Timeout**: Let browser handle, provide user feedback

### Edge Cases

1. **Edge Case**: Stream interrupted mid-response
   - **Solution**: Catch abort, save partial content, allow user to continue

2. **Edge Case**: Very fast streaming (too fast to read)
   - **Solution**: Buffer updates (optional), display all content

3. **Edge Case**: Component unmounts during streaming
   - **Solution**: useEffect cleanup aborts controller, releases reader

4. **Edge Case**: Multiple messages sent before stream completes
   - **Solution**: Disable send button while isStreaming true

5. **Edge Case**: SSE event split across chunks
   - **Solution**: Buffer incomplete events until complete

## Testing Strategy

### Manual Testing Checklist

- [ ] Stream displays character-by-character
- [ ] Long responses stream smoothly
- [ ] Auto-scroll works during streaming
- [ ] Stop button cancels stream
- [ ] Clear chat works during and after streaming
- [ ] Error messages display correctly
- [ ] Component unmounts cleanly (no warnings)
- [ ] Multiple conversations work correctly
- [ ] Streaming with conversation history works
- [ ] Very long responses don't cause memory issues

## Validation Gates

### During Implementation

```bash
# Type checking
npx tsc --noEmit -p tsconfig.app.json
npx tsc --noEmit -p tsconfig.worker.json

# Dev server
npm run dev
```

### Post-Implementation

```bash
# Build
npm run build

# Deploy test
npm run deploy
```

## Dependencies

### Same as Simple Chat

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.27.0"
  }
}
```

No additional dependencies required.

## Success Criteria

- [ ] Streaming displays in real-time
- [ ] Can stop streaming mid-response
- [ ] No memory leaks or hanging connections
- [ ] Proper error handling throughout
- [ ] Clean TypeScript types
- [ ] Auto-scroll works smoothly
- [ ] Works in all modern browsers
- [ ] Production deployment succeeds

## Known Limitations

1. **No EventSource API**: Using fetch + ReadableStream instead
   - Reason: More control over stream processing
   - Alternative: Could use EventSource for simpler implementation

2. **No Offline Support**: Requires active connection
   - Future: Could queue messages for offline send

3. **Browser-Only**: SSE not ideal for mobile apps
   - Alternative: Use WebSockets for mobile

4. **No Resume on Disconnect**: Stream lost if connection drops
   - Future: Implement reconnection with message IDs

## References

### External Resources

- Anthropic Streaming Docs: https://docs.anthropic.com/claude/reference/messages-streaming
- MDN SSE Guide: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- Cloudflare Streams: https://developers.cloudflare.com/workers/examples/streaming/
- ReadableStream API: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream

## Appendix

### SSE Format Example

```
data: {"type":"content","text":"Hello"}

data: {"type":"content","text":" world"}

data: {"type":"done","model":"claude-3-5-sonnet-20241022"}

```

Note: Each event ends with `\n\n` (double newline)

### Stream Processing Tips

1. Always buffer incomplete events
2. Use TextDecoder with `{ stream: true }` option
3. Split on `\n\n` not `\n`
4. Trim whitespace before parsing JSON
5. Handle parse errors gracefully
