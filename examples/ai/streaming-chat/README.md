# Streaming Chat Example

Advanced Claude API integration with real-time streaming responses using Server-Sent Events (SSE). This example demonstrates how to implement character-by-character streaming for a superior user experience, especially with long responses.

## What This Example Demonstrates

- Streaming responses from Claude API
- Server-Sent Events (SSE) implementation
- Real-time UI updates as tokens arrive
- Proper stream cleanup and error handling
- TypeScript type safety throughout
- Better perceived performance for users

## Features

- Real-time streaming chat interface
- Character-by-character response display
- Proper SSE connection management
- Stream interruption handling
- Loading states and error handling
- TypeScript types for streaming
- Graceful degradation if streaming fails

## Why Streaming?

### Benefits over Non-Streaming
- **Better UX**: Users see responses immediately instead of waiting
- **Perceived Performance**: Feels faster even though total time is similar
- **Long Responses**: Users can start reading while Claude is still generating
- **Engagement**: Real-time feedback keeps users engaged
- **Cancellation**: Users can stop generation mid-stream if needed

### Use Cases
- Conversational AI interfaces
- Content generation tools
- Long-form writing assistance
- Code generation and explanation
- Creative writing applications

## Prerequisites

1. **Anthropic API Key**
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Generate an API key
   - Streaming supported on all tiers

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

For local development, create a `.dev.vars` file:

```bash
# .dev.vars (DO NOT COMMIT)
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

For production:

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

### 3. Integrate Worker Endpoint

Copy the code from `worker-endpoint.ts` and add to your `worker/index.ts`:

```typescript
// worker/index.ts
import { handleStreamingChat } from './api/streaming-chat';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat-stream' && request.method === 'POST') {
      return handleStreamingChat(request, env);
    }

    // ... existing routes ...

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

### 4. Add React Component

1. Copy `StreamingChat.tsx` to `src/components/StreamingChat.tsx`
2. Copy `types.ts` to `src/types/streaming-chat.ts`

### 5. Use the Component

```tsx
// src/App.tsx
import StreamingChat from './components/StreamingChat';

function App() {
  return (
    <div className="App">
      <h1>AI Chat with Streaming</h1>
      <StreamingChat />
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

2. **Test Streaming**
   - Open http://localhost:5173
   - Type a message like "Write a short story"
   - Watch as the response streams in real-time

3. **Test Edge Cases**
   - Try very long requests
   - Test stream interruption (refresh page mid-stream)
   - Check error handling (invalid API key)

## API Endpoint Details

### POST /api/chat-stream

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

**Response:**
- Content-Type: `text/event-stream`
- Streaming SSE format
- Events: `message`, `done`, `error`

**SSE Event Format:**
```
data: {"type":"content","text":"Hello"}

data: {"type":"content","text":" there"}

data: {"type":"done","model":"claude-3-5-sonnet-20241022"}
```

## How Streaming Works

### Server-Sent Events (SSE)

SSE is a standard for streaming data from server to client:

1. **Client opens connection** to `/api/chat-stream`
2. **Server sends events** as they're available
3. **Client processes events** in real-time
4. **Connection closes** when complete

### Event Flow

```
Client                Worker                  Claude API
  |                     |                          |
  |--- POST request --->|                          |
  |                     |--- Stream request ------>|
  |                     |                          |
  |<-- SSE: content ---|<-- Stream chunk ---------|
  |<-- SSE: content ---|<-- Stream chunk ---------|
  |<-- SSE: content ---|<-- Stream chunk ---------|
  |                     |                          |
  |<-- SSE: done ------|<-- Stream complete ------|
  |                     |                          |
```

### Event Types

1. **content**: Text chunks as they arrive
2. **done**: Stream completed successfully
3. **error**: An error occurred

## Cost Estimates

### Same as Non-Streaming
- Streaming doesn't cost more than non-streaming
- Same token pricing applies
- Claude 3.5 Sonnet: ~$3 input / ~$15 output per million tokens
- Claude 3 Haiku: ~$0.25 input / ~$1.25 output per million tokens

## Customization Options

### Change Streaming Behavior

```typescript
// In worker-endpoint.ts
const stream = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2048, // Allow longer responses
  stream: true,     // Enable streaming
  // ...
});
```

### Adjust UI Update Frequency

```typescript
// In StreamingChat.tsx
// Current: Updates on every chunk (real-time)
// Option: Buffer chunks for smoother rendering
let buffer = '';
const updateInterval = setInterval(() => {
  if (buffer) {
    // Update UI with buffered content
    buffer = '';
  }
}, 50); // Update every 50ms
```

### Add Stop Generation

```typescript
// In StreamingChat.tsx
const [abortController, setAbortController] = useState<AbortController | null>(null);

const handleStop = () => {
  if (abortController) {
    abortController.abort();
    setAbortController(null);
  }
};

// In fetch call
const controller = new AbortController();
setAbortController(controller);
fetch('/api/chat-stream', {
  signal: controller.signal,
  // ...
});
```

## Security Considerations

### Same as Non-Streaming Example
- Never commit API keys
- Validate input on server
- Implement rate limiting
- Handle errors gracefully

### Streaming-Specific
- **Connection cleanup**: Always close SSE connections
- **Timeout handling**: Set reasonable timeouts
- **Resource limits**: Prevent hanging connections
- **Memory management**: Don't buffer entire response client-side

## Troubleshooting

### Issue: Streaming not working in browser
**Solution**: Check that response headers include:
```typescript
'Content-Type': 'text/event-stream',
'Cache-Control': 'no-cache',
'Connection': 'keep-alive'
```

### Issue: Events not parsing correctly
**Solution**: Ensure SSE format is correct (double newline between events):
```typescript
encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
```

### Issue: Connection drops mid-stream
**Solution**:
- Check network stability
- Implement reconnection logic
- Add heartbeat events to keep connection alive

### Issue: Slow streaming
**Solutions**:
- Reduce max_tokens
- Use Claude 3 Haiku (faster)
- Check network latency
- Verify Worker isn't being rate-limited

### Issue: Memory issues with long responses
**Solution**: Don't store full response in component state. Instead, append to DOM directly or use a more efficient state structure.

## Differences from Simple Chat Example

| Feature | Simple Chat | Streaming Chat |
|---------|-------------|----------------|
| **Response Method** | Complete response | Token-by-token |
| **API Call** | `messages.create()` | `messages.create({stream: true})` |
| **Response Type** | JSON | Server-Sent Events |
| **User Experience** | Wait for full response | See response immediately |
| **Complexity** | Simple | Moderate |
| **Use Case** | Short responses | Long-form content |

## Performance Considerations

### Advantages
- Better perceived performance
- Users can start reading immediately
- Lower "time to first byte"
- Better engagement metrics

### Disadvantages
- Slightly more complex code
- Need to handle streaming state
- Connection management overhead
- Potential for incomplete responses

## Limitations

1. **No Response Editing**: Can't modify tokens after they're sent
2. **Connection Required**: User must stay connected
3. **No Caching**: Harder to cache streaming responses
4. **Browser Support**: SSE not supported in very old browsers (IE)

## Next Steps

### Enhancements You Can Make
1. **Add Stop Button**: Let users cancel generation
2. **Add Retry Logic**: Reconnect on connection failure
3. **Add Persistence**: Store completed messages in D1
4. **Add Markdown**: Render markdown as it streams
5. **Add Code Highlighting**: Syntax highlight code blocks
6. **Add Copy Button**: Copy responses to clipboard

### Related Examples
- [Simple Claude Chat](../simple-claude-chat/) - Non-streaming version
- [Workers AI Chat](../workers-ai-chat/) - Edge AI alternative
- [Using Cloudflare AI Gateway](../with-ai-gateway/) - Production setup

## File Structure

```
streaming-chat/
├── README.md               # This file
├── worker-endpoint.ts      # SSE streaming handler
├── StreamingChat.tsx       # React streaming UI
├── types.ts               # TypeScript types
└── PRP.md                 # Implementation plan
```

## Browser Compatibility

### EventSource API (SSE)
- ✅ Chrome 6+
- ✅ Firefox 6+
- ✅ Safari 5+
- ✅ Edge 79+
- ❌ Internet Explorer (use polyfill)

### Fallback for Old Browsers
```typescript
if (!window.EventSource) {
  // Fall back to non-streaming
  console.warn('EventSource not supported, using non-streaming');
  // Use simple-claude-chat instead
}
```

## Support

- [Anthropic Streaming Docs](https://docs.anthropic.com/claude/reference/messages-streaming)
- [MDN SSE Guide](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)

## License

Part of the Cloudflare Workers + React boilerplate.
