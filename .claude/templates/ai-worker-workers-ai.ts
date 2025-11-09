/**
 * Cloudflare Worker with Workers AI Integration
 *
 * Features:
 * - Workers AI binding (no API key needed)
 * - Multiple model support (text, embeddings, image)
 * - Conversation history support
 * - Error handling
 * - CORS support
 * - Input validation
 *
 * Setup:
 * 1. Add to wrangler.jsonc:
 *    {
 *      "ai": {
 *        "binding": "AI"
 *      }
 *    }
 * 2. Run: npm run cf-typegen
 *
 * Available models:
 * - @cf/meta/llama-3.1-8b-instruct (text generation)
 * - @cf/meta/llama-3.1-70b-instruct (more powerful text generation)
 * - @cf/baai/bge-base-en-v1.5 (embeddings)
 * - @cf/stabilityai/stable-diffusion-xl-base-1.0 (image generation)
 *
 * See all models: https://developers.cloudflare.com/workers-ai/models/
 */

interface Env {
  AI: Ai;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  model?: string;
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
}

interface EmbeddingsRequest {
  text: string | string[];
}

interface EmbeddingsResponse {
  success: boolean;
  embeddings?: number[] | number[][];
  error?: string;
}

interface ImageRequest {
  prompt: string;
  numSteps?: number;
}

/**
 * CORS headers for frontend communication
 */
const getCorsHeaders = () => ({
  'Access-Control-Allow-Origin': '*', // Change to specific origin in production
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
});

/**
 * Validate chat message input
 */
function validateChatRequest(data: unknown): ChatRequest {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid request body');
  }

  const { message, conversationHistory, model } = data as Partial<ChatRequest>;

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

  // Validate conversation history if provided
  if (conversationHistory !== undefined) {
    if (!Array.isArray(conversationHistory)) {
      throw new Error('conversationHistory must be an array');
    }

    for (const msg of conversationHistory) {
      if (
        !msg ||
        typeof msg !== 'object' ||
        !['user', 'assistant', 'system'].includes(msg.role) ||
        typeof msg.content !== 'string'
      ) {
        throw new Error('Invalid message in conversationHistory');
      }
    }
  }

  return {
    message: trimmedMessage,
    conversationHistory: conversationHistory || [],
    model: model || '@cf/meta/llama-3.1-8b-instruct',
  };
}

/**
 * Handle chat request with Workers AI
 */
async function handleChatRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = getCorsHeaders();

  try {
    // Parse and validate request
    const body = await request.json();
    const { message, conversationHistory, model } = validateChatRequest(body);

    // Build messages array from history + new message
    const messages: ChatMessage[] = [
      ...conversationHistory,
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Workers AI
    const response = await env.AI.run(model as BaseAiTextGenerationModels, {
      messages,
    });

    // Return successful response
    const chatResponse: ChatResponse = {
      success: true,
      response: response.response,
    };

    return Response.json(chatResponse, { headers: corsHeaders });
  } catch (error) {
    console.error('Workers AI error:', error);

    // Handle validation errors
    if (error instanceof Error && error.message.includes('must be')) {
      return Response.json(
        {
          success: false,
          error: error.message,
        } as ChatResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // Generic error handler
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as ChatResponse,
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle embeddings request
 */
async function handleEmbeddingsRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = getCorsHeaders();

  try {
    const body = await request.json();
    const { text } = body as EmbeddingsRequest;

    if (!text) {
      throw new Error('Text is required');
    }

    // Call Workers AI for embeddings
    const response = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text,
    });

    const embeddingsResponse: EmbeddingsResponse = {
      success: true,
      embeddings: response.data,
    };

    return Response.json(embeddingsResponse, { headers: corsHeaders });
  } catch (error) {
    console.error('Embeddings error:', error);

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      } as EmbeddingsResponse,
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle image generation request
 */
async function handleImageGeneration(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = {
    ...getCorsHeaders(),
    'Content-Type': 'image/png',
  };

  try {
    const body = await request.json();
    const { prompt, numSteps = 20 } = body as ImageRequest;

    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a string');
    }

    if (prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    // Call Workers AI for image generation
    const response = await env.AI.run(
      '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      {
        prompt: prompt.trim(),
        num_steps: numSteps,
      }
    );

    // Return image directly
    return new Response(response, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Image generation error:', error);

    // Return error as JSON
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500, headers: getCorsHeaders() }
    );
  }
}

/**
 * Main worker export
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders();

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Chat endpoint
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChatRequest(request, env);
    }

    // Embeddings endpoint
    if (url.pathname === '/api/embeddings' && request.method === 'POST') {
      return handleEmbeddingsRequest(request, env);
    }

    // Image generation endpoint
    if (url.pathname === '/api/generate-image' && request.method === 'POST') {
      return handleImageGeneration(request, env);
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        aiAvailable: !!env.AI,
      });
    }

    // 404 for unknown routes
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
