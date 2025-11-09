/**
 * Cloudflare Worker with Claude API Integration
 *
 * Features:
 * - Anthropic SDK integration
 * - Conversation history support
 * - Error handling
 * - CORS support
 * - Input validation
 * - Optional AI Gateway routing
 *
 * Setup:
 * 1. npm install @anthropic-ai/sdk
 * 2. npx wrangler secret put ANTHROPIC_API_KEY
 * 3. For local dev: echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
 *
 * Optional - AI Gateway:
 * Add to wrangler.jsonc:
 * {
 *   "vars": {
 *     "AI_GATEWAY_ID": "your-gateway-id",
 *     "AI_GATEWAY_ACCOUNT": "your-account-id"
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

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
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

  const { message, conversationHistory } = data as Partial<ChatRequest>;

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
        !['user', 'assistant'].includes(msg.role) ||
        typeof msg.content !== 'string'
      ) {
        throw new Error('Invalid message in conversationHistory');
      }
    }
  }

  return {
    message: trimmedMessage,
    conversationHistory: conversationHistory || [],
  };
}

/**
 * Handle chat request with Claude API
 */
async function handleChatRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const corsHeaders = getCorsHeaders();

  try {
    // Parse and validate request
    const body = await request.json();
    const { message, conversationHistory } = validateChatRequest(body);

    // Initialize Anthropic client
    const anthropicConfig: Anthropic.ClientOptions = {
      apiKey: env.ANTHROPIC_API_KEY,
    };

    // Optional: Route through AI Gateway for caching
    if (env.AI_GATEWAY_ID && env.AI_GATEWAY_ACCOUNT) {
      anthropicConfig.baseURL = `https://gateway.ai.cloudflare.com/v1/${env.AI_GATEWAY_ACCOUNT}/${env.AI_GATEWAY_ID}/anthropic`;
    }

    const anthropic = new Anthropic(anthropicConfig);

    // Build messages array from history + new message
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

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Latest model
      max_tokens: 2048, // Adjust based on your needs
      messages,
      // Optional: Add system prompt
      // system: "You are a helpful assistant.",
    });

    // Extract text from response
    const textContent = response.content.find((c) => c.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response');
    }

    // Return successful response
    const chatResponse: ChatResponse = {
      success: true,
      response: textContent.text,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };

    return Response.json(chatResponse, { headers: corsHeaders });
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle Anthropic-specific errors
    if (error instanceof Anthropic.APIError) {
      let status = error.status || 500;
      let errorMessage = error.message;

      // Map common errors to user-friendly messages
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request to AI service';
          break;
        case 401:
          errorMessage = 'AI service authentication failed';
          status = 500; // Don't expose auth errors to client
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please try again later.';
          break;
        case 500:
        case 529:
          errorMessage = 'AI service temporarily unavailable';
          status = 503;
          break;
      }

      return Response.json(
        {
          success: false,
          error: errorMessage,
        } as ChatResponse,
        { status, headers: corsHeaders }
      );
    }

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

    // Health check endpoint
    if (url.pathname === '/api/health') {
      return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    }

    // 404 for unknown routes
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
