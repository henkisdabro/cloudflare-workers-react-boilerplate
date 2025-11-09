/**
 * Type definitions for Simple Claude Chat
 *
 * These types ensure type safety across the chat application,
 * from the React frontend to the Cloudflare Worker backend.
 */

/**
 * Represents a single message in the conversation
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: 'user' | 'assistant';
  /** Content of the message */
  content: string;
  /** Optional timestamp for when the message was created */
  timestamp?: number;
  /** Optional unique identifier for the message */
  id?: string;
}

/**
 * Request body for the /api/chat endpoint
 */
export interface ChatRequest {
  /** The user's message to send to Claude */
  message: string;
  /** Optional conversation history for context */
  conversationHistory?: ChatMessage[];
  /** Optional model to use (defaults to claude-3-5-sonnet) */
  model?: string;
  /** Optional maximum tokens for response */
  maxTokens?: number;
  /** Optional temperature (0-1) for response creativity */
  temperature?: number;
  /** Optional system prompt to guide Claude's behavior */
  system?: string;
}

/**
 * Successful response from the /api/chat endpoint
 */
export interface ChatResponse {
  /** Claude's response message */
  message: string;
  /** Model used for the response */
  model: string;
  /** Optional token usage information */
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Error response from the /api/chat endpoint
 */
export interface ChatErrorResponse {
  /** Error message */
  error: string;
  /** Optional error details */
  details?: string;
}

/**
 * Type guard to check if response is an error
 */
export function isChatError(
  response: ChatResponse | ChatErrorResponse
): response is ChatErrorResponse {
  return 'error' in response;
}

/**
 * Available Claude models
 */
export const CLAUDE_MODELS = {
  /** Latest and most capable Claude model */
  SONNET_3_5: 'claude-3-5-sonnet-20241022',
  /** Fast and cost-effective Claude model */
  HAIKU_3: 'claude-3-haiku-20240307',
  /** Balanced Claude model */
  SONNET_3: 'claude-3-sonnet-20240229',
} as const;

export type ClaudeModel = typeof CLAUDE_MODELS[keyof typeof CLAUDE_MODELS];

/**
 * Configuration options for the chat component
 */
export interface ChatConfig {
  /** API endpoint URL */
  apiEndpoint: string;
  /** Model to use */
  model: ClaudeModel;
  /** Maximum tokens per response */
  maxTokens: number;
  /** Temperature for response creativity (0-1) */
  temperature: number;
  /** System prompt */
  system?: string;
  /** Whether to include conversation history in requests */
  includeHistory: boolean;
  /** Maximum number of messages to keep in history */
  maxHistoryLength: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CHAT_CONFIG: ChatConfig = {
  apiEndpoint: '/api/chat',
  model: CLAUDE_MODELS.SONNET_3_5,
  maxTokens: 1024,
  temperature: 0.7,
  includeHistory: true,
  maxHistoryLength: 10,
};

/**
 * UI state for the chat component
 */
export interface ChatUIState {
  /** Whether a request is currently in progress */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Array of messages in the conversation */
  messages: ChatMessage[];
  /** Current input value */
  input: string;
}
