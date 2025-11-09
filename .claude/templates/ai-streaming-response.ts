/**
 * Cloudflare Worker with Streaming AI Responses
 *
 * Features:
 * - Server-sent events (SSE) streaming
 * - Real-time response streaming from Claude API
 * - Error handling for streams
 * - CORS support
 * - Input validation
 *
 * Setup:
 * 1. npm install @anthropic-ai/sdk
 * 2. npx wrangler secret put ANTHROPIC_API_KEY
 * 3. For local dev: echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
 *
 * Client Usage:
 * const response = await fetch('/api/chat-stream', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ message: 'Hello!' }),
 * });
 *
 * const reader = response.body.getReader();
 * const decoder = new TextDecoder();
 *
 * while (true) {
 *   const { done, value } = await reader.read();
 *   if (done) break;
 *
 *   const chunk = decoder.decode(value);
 *   const lines = chunk.split('\n');
 *
 *   for (const line of lines) {
 *     if (line.startsWith('data: ')) {
 *       const data = line.slice(6);
 *       if (data === '[DONE]') break;
 *       const parsed = JSON.parse(data);
 *       console.log(parsed.text);
 *     }
 *   }
 * }
 */

import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
  // Optional: AI Gateway configuration
  AI_GATEWAY_ID?: string;
  AI_GATEWAY_ACCOUNT?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface StreamChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

interface StreamChunk {
  text?: string;
  error?: string;
  done?: boolean;
}

/**
 * CORS headers for SSE
 */
const getStreamHeaders = () => ({
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

/**
 * Validate streaming chat request
 */
function validateStreamRequest(data: unknown): StreamChatRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const { message, conversationHistory } = data as Partial<StreamChatRequest>;

  if (!message || typeof message !== 'string') {
    throw new Error('Message must be a string');
  }

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (trimmedMessage.length > 10000) {
    throw new Error('Message too long (max 10000 characters)');
  }

  return {
    message: trimmedMessage,
    conversationHistory: conversationHistory || [],
  };
}

/**
 * Format SSE data
 */
function formatSSE(data: StreamChunk): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

/**
 * Handle streaming chat request
 */
async function handleStreamingChat(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // Parse and validate request
    const body = await request.json();
    const { message, conversationHistory } = validateStreamRequest(body);

    // Create ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Initialize Anthropic client
          const anthropicConfig: Anthropic.ClientOptions = {
            apiKey: env.ANTHROPIC_API_KEY,
          };

          // Optional: Route through AI Gateway
          if (env.AI_GATEWAY_ID && env.AI_GATEWAY_ACCOUNT) {
            anthropicConfig.baseURL = `https://gateway.ai.cloudflare.com/v1/${env.AI_GATEWAY_ACCOUNT}/${env.AI_GATEWAY_ID}/anthropic`;
          }

          const anthropic = new Anthropic(anthropicConfig);

          // Build messages array
          const messages: Anthropic.MessageParam[] = [
            ...conversationHistory.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            {
              role: 'user',
              content: message,
            },
          ];

          // Create streaming request
          const stream = await anthropic.messages.stream({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2048,
            messages,
          });

          // Stream chunks to client
          for await (const chunk of stream) {
            // Only send text deltas
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = formatSSE({ text: chunk.delta.text });
              controller.enqueue(encoder.encode(data));
            }

            // Handle completion
            if (chunk.type === 'message_stop') {
              const data = formatSSE({ done: true });
              controller.enqueue(encoder.encode(data));
            }
          }

          // Send done marker
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);

          // Send error to client
          const errorData = formatSSE({
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: getStreamHeaders(),
    });
  } catch (error) {
    console.error('Stream setup error:', error);

    // Return error as JSON for setup errors
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * Main worker export
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Streaming chat endpoint
    if (url.pathname === '/api/chat-stream' && request.method === 'POST') {
      return handleStreamingChat(request, env);
    }

    // Health check
    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        streaming: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 404 for unknown routes
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;

/**
 * React Hook for Streaming Chat
 *
 * Usage example in React component:
 *
 * import { useState } from 'react';
 *
 * export default function StreamingChat() {
 *   const [response, setResponse] = useState('');
 *   const [streaming, setStreaming] = useState(false);
 *
 *   const sendMessage = async (message: string) => {
 *     setStreaming(true);
 *     setResponse('');
 *
 *     try {
 *       const res = await fetch('/api/chat-stream', {
 *         method: 'POST',
 *         headers: { 'Content-Type': 'application/json' },
 *         body: JSON.stringify({ message }),
 *       });
 *
 *       const reader = res.body!.getReader();
 *       const decoder = new TextDecoder();
 *
 *       while (true) {
 *         const { done, value } = await reader.read();
 *         if (done) break;
 *
 *         const chunk = decoder.decode(value);
 *         const lines = chunk.split('\n');
 *
 *         for (const line of lines) {
 *           if (line.startsWith('data: ')) {
 *             const data = line.slice(6);
 *             if (data === '[DONE]') break;
 *
 *             try {
 *               const parsed = JSON.parse(data);
 *               if (parsed.text) {
 *                 setResponse(prev => prev + parsed.text);
 *               }
 *               if (parsed.error) {
 *                 console.error('Stream error:', parsed.error);
 *               }
 *             } catch (e) {
 *               // Ignore parse errors
 *             }
 *           }
 *         }
 *       }
 *     } catch (error) {
 *       console.error('Streaming error:', error);
 *     } finally {
 *       setStreaming(false);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={() => sendMessage('Hello!')} disabled={streaming}>
 *         {streaming ? 'Streaming...' : 'Send'}
 *       </button>
 *       <div>{response}</div>
 *     </div>
 *   );
 * }
 */
