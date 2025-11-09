/**
 * Workers AI Chat - Worker Endpoint
 *
 * This file contains the Worker endpoint implementation for handling
 * chat requests with Cloudflare Workers AI (no external API required).
 *
 * INTEGRATION INSTRUCTIONS:
 * 1. Add AI binding to wrangler.jsonc: { "ai": { "binding": "AI" } }
 * 2. Run npm run cf-typegen to generate types
 * 3. Add this code to your worker/index.ts
 * 4. No API keys needed - uses Cloudflare AI binding
 */

import type {
  WorkersAIChatRequest,
  WorkersAIChatResponse,
  WorkersAIChatErrorResponse,
  WorkersAIMessage,
} from './types';

/**
 * Handles POST requests to /api/ai-chat
 * Uses Cloudflare Workers AI for inference
 *
 * @param request - The incoming request
 * @param env - Environment bindings (contains AI binding)
 * @returns JSON response with AI's message or error
 */
export async function handleWorkersAIChat(
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
    return Response.json(
      { error: 'Method not allowed' } as WorkersAIChatErrorResponse,
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Validate AI binding exists
    if (!env.AI) {
      console.error('AI binding not found in environment');
      return Response.json(
        {
          error: 'Workers AI not configured',
          details: 'Add AI binding to wrangler.jsonc',
        } as WorkersAIChatErrorResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = (await request.json()) as WorkersAIChatRequest;

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return Response.json(
        {
          error: 'Message is required and must be a string',
        } as WorkersAIChatErrorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate message length (prevent abuse)
    if (body.message.length > 10000) {
      return Response.json(
        {
          error: 'Message too long (max 10,000 characters)',
        } as WorkersAIChatErrorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Build messages array for Workers AI
    const messages: WorkersAIMessage[] = [];

    // Add system prompt if provided
    if (body.system) {
      messages.push({
        role: 'system',
        content: body.system,
      });
    }

    // Add conversation history if provided
    if (body.conversationHistory && Array.isArray(body.conversationHistory)) {
      for (const msg of body.conversationHistory) {
        if (msg.role && msg.content) {
          messages.push({
            role: msg.role as 'user' | 'assistant',
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

    // Choose model (default to Llama 3.1 8B)
    const model = body.model || '@cf/meta/llama-3.1-8b-instruct';

    // Call Workers AI
    const aiResponse = await env.AI.run(model, {
      messages,
    });

    // Extract response text
    // Workers AI response format varies by model
    let responseText: string;

    if (typeof aiResponse === 'object' && aiResponse !== null) {
      // Handle different response formats
      if ('response' in aiResponse && typeof aiResponse.response === 'string') {
        responseText = aiResponse.response;
      } else if (
        'text' in aiResponse &&
        typeof aiResponse.text === 'string'
      ) {
        responseText = aiResponse.text;
      } else if (
        'content' in aiResponse &&
        typeof aiResponse.content === 'string'
      ) {
        responseText = aiResponse.content;
      } else {
        // Fallback: stringify the response
        responseText = JSON.stringify(aiResponse);
      }
    } else if (typeof aiResponse === 'string') {
      responseText = aiResponse;
    } else {
      throw new Error('Unexpected response format from Workers AI');
    }

    // Trim whitespace
    responseText = responseText.trim();

    if (!responseText) {
      throw new Error('Empty response from Workers AI');
    }

    // Build success response
    const chatResponse: WorkersAIChatResponse = {
      message: responseText,
      model: model,
    };

    return Response.json(chatResponse, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error('Workers AI chat error:', error);

    // Handle different error types
    let errorMessage = 'An error occurred processing your request';
    let errorDetails: string | undefined;

    if (error instanceof Error) {
      errorMessage = 'Workers AI error';
      errorDetails = error.message;

      // Check for specific error types
      if (error.message.includes('model not found')) {
        errorMessage = 'Model not available';
        errorDetails = 'The requested model is not available in Workers AI';
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded';
        errorDetails = 'Please try again in a moment';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Usage quota exceeded';
        errorDetails = 'Your Workers AI usage limit has been reached';
      }
    }

    return Response.json(
      {
        error: errorMessage,
        details: errorDetails,
      } as WorkersAIChatErrorResponse,
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

/**
 * INTEGRATION EXAMPLE:
 *
 * Add this to your worker/index.ts:
 *
 * ```typescript
 * import { handleWorkersAIChat } from './api/workers-ai-chat';
 *
 * export default {
 *   async fetch(request: Request, env: Env): Promise<Response> {
 *     const url = new URL(request.url);
 *
 *     // Workers AI chat endpoint
 *     if (url.pathname === '/api/ai-chat') {
 *       return handleWorkersAIChat(request, env);
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
 * WRANGLER.JSONC CONFIGURATION:
 *
 * Add the AI binding to your wrangler.jsonc:
 *
 * ```jsonc
 * {
 *   "name": "your-worker-name",
 *   "main": "worker/index.ts",
 *   "compatibility_date": "2025-11-09",
 *   // Add this:
 *   "ai": {
 *     "binding": "AI"
 *   }
 * }
 * ```
 *
 * Then run: npm run cf-typegen
 */

/**
 * AVAILABLE MODELS:
 *
 * Popular Workers AI models:
 *
 * - '@cf/meta/llama-3.1-8b-instruct' (recommended, best quality)
 * - '@cf/meta/llama-3.2-1b-instruct' (fastest)
 * - '@cf/meta/llama-3.2-3b-instruct' (balanced)
 * - '@cf/mistral/mistral-7b-instruct-v0.1' (alternative)
 * - '@cf/qwen/qwen1.5-14b-chat-awq' (large, best quality)
 *
 * Full list: https://developers.cloudflare.com/workers-ai/models/
 */

/**
 * STREAMING (Optional):
 *
 * Workers AI also supports streaming responses:
 *
 * ```typescript
 * const aiResponse = await env.AI.run(model, {
 *   messages,
 *   stream: true,
 * });
 *
 * // aiResponse is now a ReadableStream
 * return new Response(aiResponse, {
 *   headers: {
 *     'Content-Type': 'text/event-stream',
 *     'Cache-Control': 'no-cache',
 *   },
 * });
 * ```
 *
 * See streaming-chat example for SSE implementation.
 */

/**
 * RATE LIMITING (Recommended):
 *
 * Implement rate limiting to prevent abuse:
 *
 * ```typescript
 * // Track requests per IP
 * const rateLimits = new Map<string, number>();
 *
 * function checkRateLimit(ip: string): boolean {
 *   const now = Date.now();
 *   const lastRequest = rateLimits.get(ip) || 0;
 *
 *   if (now - lastRequest < 2000) { // 2 seconds between requests
 *     return false;
 *   }
 *
 *   rateLimits.set(ip, now);
 *   return true;
 * }
 *
 * // In handler:
 * const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
 * if (!checkRateLimit(clientIP)) {
 *   return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
 * }
 * ```
 */

/**
 * COST MONITORING:
 *
 * Monitor your Workers AI usage in Cloudflare dashboard:
 * https://dash.cloudflare.com/?to=/:account/ai/workers-ai
 *
 * Pricing: $5/month includes 10M neurons, then $0.011 per 1,000 neurons
 */
