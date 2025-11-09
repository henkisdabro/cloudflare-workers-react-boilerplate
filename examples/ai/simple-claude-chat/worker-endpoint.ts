/**
 * Simple Claude Chat - Worker Endpoint
 *
 * This file contains the Worker endpoint implementation for handling
 * chat requests with Claude API (non-streaming).
 *
 * INTEGRATION INSTRUCTIONS:
 * 1. Install dependencies: npm install @anthropic-ai/sdk
 * 2. Add this code to your worker/index.ts
 * 3. Set ANTHROPIC_API_KEY in .dev.vars (local) or Cloudflare secrets (production)
 * 4. Add the route handler to your fetch function
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ChatRequest, ChatResponse, ChatErrorResponse } from './types';

/**
 * Handles POST requests to /api/chat
 *
 * @param request - The incoming request
 * @param env - Environment bindings (contains ANTHROPIC_API_KEY)
 * @returns JSON response with Claude's message or error
 */
export async function handleChat(
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
      { error: 'Method not allowed' } as ChatErrorResponse,
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Validate API key exists
    if (!env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY not found in environment');
      return Response.json(
        { error: 'API key not configured' } as ChatErrorResponse,
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse request body
    const body = (await request.json()) as ChatRequest;

    // Validate required fields
    if (!body.message || typeof body.message !== 'string') {
      return Response.json(
        { error: 'Message is required and must be a string' } as ChatErrorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate message length (prevent abuse)
    if (body.message.length > 10000) {
      return Response.json(
        { error: 'Message too long (max 10,000 characters)' } as ChatErrorResponse,
        { status: 400, headers: corsHeaders }
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
      // Validate and add history messages
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

    // Call Claude API (non-streaming)
    const response = await anthropic.messages.create({
      model: body.model || 'claude-3-5-sonnet-20241022',
      max_tokens: body.maxTokens || 1024,
      temperature: body.temperature ?? 0.7,
      system: body.system,
      messages,
    });

    // Extract text content from response
    const messageContent = response.content.find(
      (block) => block.type === 'text'
    );

    if (!messageContent || messageContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Build success response
    const chatResponse: ChatResponse = {
      message: messageContent.text,
      model: response.model,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
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
    console.error('Chat API error:', error);

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        {
          error: 'AI API error',
          details: error.message,
        } as ChatErrorResponse,
        {
          status: error.status || 500,
          headers: corsHeaders,
        }
      );
    }

    // Handle other errors
    return Response.json(
      {
        error: 'An error occurred processing your request',
        details: error instanceof Error ? error.message : 'Unknown error',
      } as ChatErrorResponse,
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
 * import { handleChat } from './api/chat'; // Adjust path as needed
 *
 * export default {
 *   async fetch(request: Request, env: Env): Promise<Response> {
 *     const url = new URL(request.url);
 *
 *     // Chat endpoint
 *     if (url.pathname === '/api/chat') {
 *       return handleChat(request, env);
 *     }
 *
 *     // ... other routes ...
 *
 *     return new Response(null, { status: 404 });
 *   },
 * } satisfies ExportedHandler<Env>;
 * ```
 *
 * Don't forget to:
 * 1. Set ANTHROPIC_API_KEY secret: npx wrangler secret put ANTHROPIC_API_KEY
 * 2. For local dev, create .dev.vars with: ANTHROPIC_API_KEY=sk-ant-...
 * 3. Run cf-typegen to get proper types: npm run cf-typegen
 */

/**
 * ENVIRONMENT TYPES:
 *
 * Update your worker-configuration.d.ts or env.d.ts to include:
 *
 * ```typescript
 * interface Env {
 *   ANTHROPIC_API_KEY: string;
 *   // ... other bindings ...
 * }
 * ```
 */

/**
 * RATE LIMITING (Optional but recommended):
 *
 * For production, implement rate limiting using Cloudflare KV or Durable Objects:
 *
 * ```typescript
 * async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
 *   const key = `rate_limit:${ip}`;
 *   const current = await env.KV.get(key);
 *
 *   if (current && parseInt(current) >= 10) { // 10 requests per minute
 *     return false;
 *   }
 *
 *   const count = current ? parseInt(current) + 1 : 1;
 *   await env.KV.put(key, count.toString(), { expirationTtl: 60 });
 *   return true;
 * }
 * ```
 */
