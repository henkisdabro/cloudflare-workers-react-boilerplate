/**
 * AI Gateway Proxy - Worker Endpoint Examples
 *
 * This file contains example implementations showing how to use
 * Cloudflare AI Gateway with different providers and patterns.
 *
 * INTEGRATION INSTRUCTIONS:
 * 1. Create AI Gateway in Cloudflare dashboard
 * 2. Add gateway URL to environment variables
 * 3. Update existing chat endpoint to use gateway baseURL
 * 4. No other code changes needed!
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Example 1: Simple Gateway Integration
 *
 * Modify existing Anthropic chat handler to use AI Gateway
 */
export async function handleChatWithGateway(
  request: Request,
  env: Env
): Promise<Response> {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await request.json();

    // Initialize Anthropic with Gateway URL
    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      // THIS IS THE ONLY CHANGE NEEDED!
      baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
    });

    // Use normally - requests automatically go through gateway
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
    });

    return Response.json(
      {
        message: response.content[0].text,
        model: response.model,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Gateway chat error:', error);
    return Response.json(
      { error: 'An error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Example 2: Streaming with Gateway
 *
 * Streaming works through AI Gateway with no changes
 */
export async function handleStreamingWithGateway(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await request.json();

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
    });

    // Streaming works through gateway!
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    // Process stream as normal
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            if (event.delta.type === 'text_delta') {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({ type: 'content', text: event.delta.text })}\n\n`
                )
              );
            }
          }

          if (event.type === 'message_stop') {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
            );
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Gateway streaming error:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
}

/**
 * Example 3: Multi-Provider with Fallback
 *
 * Try Claude first, fallback to OpenAI if it fails
 */
export async function handleChatWithFallback(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await request.json();

    // Try Claude first
    try {
      const anthropic = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
        baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: message }],
      });

      return Response.json(
        {
          message: response.content[0].text,
          model: response.model,
          provider: 'anthropic',
        },
        { headers: corsHeaders }
      );
    } catch (claudeError) {
      console.log('Claude failed, trying OpenAI...', claudeError);

      // Fallback to OpenAI through gateway
      const openaiResponse = await fetch(
        `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/openai/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: message }],
            max_tokens: 1024,
          }),
        }
      );

      const data = await openaiResponse.json();

      return Response.json(
        {
          message: data.choices[0].message.content,
          model: data.model,
          provider: 'openai',
        },
        { headers: corsHeaders }
      );
    }
  } catch (error) {
    console.error('All providers failed:', error);
    return Response.json(
      { error: 'Service unavailable' },
      { status: 503, headers: corsHeaders }
    );
  }
}

/**
 * Example 4: Custom Metadata Tracking
 *
 * Add metadata to requests for analytics tracking
 */
export async function handleChatWithMetadata(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, feature } = await request.json();

    // Build gateway URL
    const gatewayURL = `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic/v1/messages`;

    // Make request with custom metadata
    const response = await fetch(gatewayURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        // Add custom metadata for analytics
        'cf-aig-metadata': JSON.stringify({
          user_id: userId || 'anonymous',
          feature: feature || 'chat',
          version: 'v2',
          timestamp: Date.now(),
        }),
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{ role: 'user', content: message }],
      }),
    });

    const data = await response.json();

    return Response.json(
      {
        message: data.content[0].text,
        model: data.model,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Gateway metadata error:', error);
    return Response.json(
      { error: 'An error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Example 5: Cache Control
 *
 * Control caching behavior per request
 */
export async function handleChatWithCacheControl(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, bypassCache = false } = await request.json();

    const anthropic = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
      // Add cache control header if needed
      defaultHeaders: bypassCache
        ? { 'Cache-Control': 'no-cache' }
        : undefined,
    });

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }],
    });

    return Response.json(
      {
        message: response.content[0].text,
        model: response.model,
        cached: !bypassCache,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Gateway cache control error:', error);
    return Response.json(
      { error: 'An error occurred' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * ENVIRONMENT VARIABLES NEEDED:
 *
 * In wrangler.jsonc:
 * ```jsonc
 * {
 *   "vars": {
 *     "CLOUDFLARE_ACCOUNT_ID": "your-account-id",
 *     "GATEWAY_NAME": "your-gateway-name"
 *   }
 * }
 * ```
 *
 * As secrets:
 * ```bash
 * npx wrangler secret put ANTHROPIC_API_KEY
 * npx wrangler secret put OPENAI_API_KEY  # If using OpenAI
 * ```
 *
 * In .dev.vars (local):
 * ```
 * CLOUDFLARE_ACCOUNT_ID=abc123
 * GATEWAY_NAME=my-gateway
 * ANTHROPIC_API_KEY=sk-ant-...
 * OPENAI_API_KEY=sk-...
 * ```
 */

/**
 * INTEGRATION EXAMPLE:
 *
 * Updating existing simple-claude-chat example:
 *
 * ```typescript
 * // Before (simple-claude-chat/worker-endpoint.ts):
 * const anthropic = new Anthropic({
 *   apiKey: env.ANTHROPIC_API_KEY,
 * });
 *
 * // After (with AI Gateway):
 * const anthropic = new Anthropic({
 *   apiKey: env.ANTHROPIC_API_KEY,
 *   baseURL: `https://gateway.ai.cloudflare.com/v1/${env.CLOUDFLARE_ACCOUNT_ID}/${env.GATEWAY_NAME}/anthropic`,
 * });
 * ```
 *
 * That's it! All requests now go through AI Gateway with:
 * - Automatic caching
 * - Analytics tracking
 * - Cost monitoring
 * - Rate limiting
 * - Request logging
 */

/**
 * ANALYTICS ACCESS:
 *
 * View analytics in Cloudflare dashboard:
 * https://dash.cloudflare.com/ai/ai-gateway/{gateway_id}/analytics
 *
 * Metrics available:
 * - Request volume
 * - Cache hit rate
 * - Total costs
 * - Error rates
 * - Latency percentiles
 * - Cost per model
 * - Custom metadata filtering
 */
