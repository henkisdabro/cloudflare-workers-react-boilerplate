/**
 * Streaming Chat - Worker Endpoint
 *
 * This file contains the Worker endpoint implementation for handling
 * streaming chat requests with Claude API using Server-Sent Events (SSE).
 *
 * INTEGRATION INSTRUCTIONS:
 * 1. Install dependencies: npm install @anthropic-ai/sdk
 * 2. Add this code to your worker/index.ts
 * 3. Set ANTHROPIC_API_KEY in .dev.vars (local) or Cloudflare secrets (production)
 * 4. Add the route handler to your fetch function
 */

import Anthropic from '@anthropic-ai/sdk';
import type { StreamingChatRequest } from './types';

/**
 * Handles POST requests to /api/chat-stream
 * Returns a Server-Sent Events (SSE) stream of Claude's response
 *
 * @param request - The incoming request
 * @param env - Environment bindings (contains ANTHROPIC_API_KEY)
 * @returns SSE stream response
 */
export async function handleStreamingChat(
  request: Request,
  env: Env
): Promise<Response> {
  // CORS headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    // Validate API key exists
    if (!env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment');
      return createErrorStream('API key not configured', corsHeaders);
    }

    // Parse request body
    const body = (await request.json()) as StreamingChatRequest;

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return createErrorStream(
        'Message is required and must be a string',
        corsHeaders
      );
    }

    // Validate message length
    if (body.message.length > 10000) {
      return createErrorStream(
        'Message too long (max 10,000 characters)',
        corsHeaders
      );
    }

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });

    // Build messages array for Claude API
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history if provided
    if (body.conversationHistory && Array.isArray(body.conversationHistory)) {
      for (const msg of body.conversationHistory) {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: body.message,
    });

    // Create a TransformStream for SSE
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Helper function to send SSE event
    const sendEvent = async (data: object) => {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(message));
    };

    // Start streaming in background
    (async () => {
      try {
        // Call Claude API with streaming enabled
        const stream = await anthropic.messages.create({
          model: body.model || 'claude-3-5-sonnet-20241022',
          max_tokens: body.maxTokens || 2048,
          temperature: body.temperature ?? 0.7,
          system: body.system,
          messages,
          stream: true, // Enable streaming
        });

        // Process stream events
        for await (const event of stream) {
          // Handle different event types
          if (event.type === 'content_block_start') {
            // Content block started (we can ignore this)
            continue;
          }

          if (event.type === 'content_block_delta') {
            // New content chunk
            if (event.delta.type === 'text_delta') {
              await sendEvent({
                type: 'content',
                text: event.delta.text,
              });
            }
          }

          if (event.type === 'message_delta') {
            // Message metadata update (usually stop reason)
            // We can ignore this during streaming
            continue;
          }

          if (event.type === 'message_stop') {
            // Stream complete
            // Send final message with metadata
            const messageData = stream.currentMessage;
            await sendEvent({
              type: 'done',
              model: messageData.model,
              usage: {
                input_tokens: messageData.usage.input_tokens,
                output_tokens: messageData.usage.output_tokens,
              },
              stop_reason: messageData.stop_reason,
            });
            break;
          }
        }
      } catch (error) {
        console.error('Streaming error:', error);

        // Send error event
        await sendEvent({
          type: 'error',
          error:
            error instanceof Anthropic.APIError
              ? error.message
              : 'An error occurred during streaming',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
      } finally {
        // Close the writer
        await writer.close();
      }
    })();

    // Return SSE response
    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat stream setup error:', error);
    return createErrorStream(
      'Failed to initialize stream',
      corsHeaders
    );
  }
}

/**
 * Helper function to create an error stream response
 */
function createErrorStream(
  errorMessage: string,
  corsHeaders: Record<string, string>
): Response {
  const encoder = new TextEncoder();
  const errorEvent = `data: ${JSON.stringify({
    type: 'error',
    error: errorMessage,
  })}\n\n`;

  return new Response(encoder.encode(errorEvent), {
    status: 200, // SSE should return 200 even for errors
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}

/**
 * INTEGRATION EXAMPLE:
 *
 * Add this to your worker/index.ts:
 *
 * ```typescript
 * import { handleStreamingChat } from './api/streaming-chat';
 *
 * export default {
 *   async fetch(request: Request, env: Env): Promise<Response> {
 *     const url = new URL(request.url);
 *
 *     // Streaming chat endpoint
 *     if (url.pathname === '/api/chat-stream') {
 *       return handleStreamingChat(request, env);
 *     }
 *
 *     // ... other routes ...
 *
 *     return new Response(null, { status: 404 });
 *   },
 * } satisfies ExportedHandler<Env>;
 * ```
 */

/**
 * CLIENT-SIDE USAGE EXAMPLE:
 *
 * ```typescript
 * const response = await fetch('/api/chat-stream', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ message: 'Hello!' }),
 * });
 *
 * const reader = response.body!.getReader();
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
 *       const data = JSON.parse(line.slice(6));
 *       if (data.type === 'content') {
 *         console.log('Content:', data.text);
 *       } else if (data.type === 'done') {
 *         console.log('Stream complete');
 *       } else if (data.type === 'error') {
 *         console.error('Error:', data.error);
 *       }
 *     }
 *   }
 * }
 * ```
 */

/**
 * SSE EVENT FORMAT:
 *
 * Content events:
 * data: {"type":"content","text":"Hello"}
 *
 * Done event:
 * data: {"type":"done","model":"claude-3-5-sonnet-20241022","usage":{...}}
 *
 * Error event:
 * data: {"type":"error","error":"Error message"}
 *
 * Note: Each event ends with \n\n (double newline)
 */

/**
 * RATE LIMITING (Recommended for production):
 *
 * Streaming requests can be more resource-intensive. Implement rate limiting:
 *
 * ```typescript
 * // Track concurrent streams per IP
 * const activeStreams = new Map<string, number>();
 *
 * function checkStreamLimit(ip: string): boolean {
 *   const current = activeStreams.get(ip) || 0;
 *   if (current >= 2) { // Max 2 concurrent streams per IP
 *     return false;
 *   }
 *   activeStreams.set(ip, current + 1);
 *   return true;
 * }
 *
 * function releaseStreamSlot(ip: string) {
 *   const current = activeStreams.get(ip) || 0;
 *   if (current > 0) {
 *     activeStreams.set(ip, current - 1);
 *   }
 * }
 * ```
 */
