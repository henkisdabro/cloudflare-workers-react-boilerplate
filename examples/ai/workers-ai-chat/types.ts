/**
 * Type definitions for Workers AI Chat
 *
 * These types ensure type safety for Cloudflare Workers AI integration.
 */

/**
 * Represents a single message in the conversation
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: 'user' | 'assistant' | 'system';
  /** Content of the message */
  content: string;
  /** Optional timestamp for when the message was created */
  timestamp?: number;
  /** Optional unique identifier for the message */
  id?: string;
}

/**
 * Request body for the /api/ai-chat endpoint
 */
export interface WorkersAIChatRequest {
  /** The user's message to send to Workers AI */
  message: string;
  /** Optional conversation history for context */
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  /** Optional model to use (defaults to Llama 3.1 8B) */
  model?: WorkersAIModel;
  /** Optional system prompt to guide AI behavior */
  system?: string;
}

/**
 * Successful response from the /api/ai-chat endpoint
 */
export interface WorkersAIChatResponse {
  /** AI's response message */
  message: string;
  /** Model used for the response */
  model: string;
}

/**
 * Error response from the /api/ai-chat endpoint
 */
export interface WorkersAIChatErrorResponse {
  /** Error message */
  error: string;
  /** Optional error details */
  details?: string;
}

/**
 * Type guard to check if response is an error
 */
export function isWorkersAIError(
  response: WorkersAIChatResponse | WorkersAIChatErrorResponse
): response is WorkersAIChatErrorResponse {
  return 'error' in response;
}

/**
 * Available Workers AI models for text generation
 */
export const WORKERS_AI_MODELS = {
  /** Llama 3.1 8B - Best quality, recommended for most use cases */
  LLAMA_3_1_8B: '@cf/meta/llama-3.1-8b-instruct',
  /** Llama 3.2 1B - Fastest, good for simple tasks */
  LLAMA_3_2_1B: '@cf/meta/llama-3.2-1b-instruct',
  /** Llama 3.2 3B - Balanced performance */
  LLAMA_3_2_3B: '@cf/meta/llama-3.2-3b-instruct',
  /** Mistral 7B - Alternative, good quality */
  MISTRAL_7B: '@cf/mistral/mistral-7b-instruct-v0.1',
  /** Qwen 1.5 14B - Large model, best quality but slower */
  QWEN_1_5_14B: '@cf/qwen/qwen1.5-14b-chat-awq',
} as const;

export type WorkersAIModel =
  typeof WORKERS_AI_MODELS[keyof typeof WORKERS_AI_MODELS];

/**
 * Model metadata for UI display and selection
 */
export interface WorkersAIModelInfo {
  /** Model identifier */
  id: WorkersAIModel;
  /** Display name */
  name: string;
  /** Brief description */
  description: string;
  /** Typical response speed */
  speed: 'fast' | 'medium' | 'slow';
  /** Relative quality */
  quality: 'good' | 'better' | 'best';
  /** Context window size */
  contextLength: number;
}

/**
 * Model information for all available models
 */
export const WORKERS_AI_MODEL_INFO: Record<
  WorkersAIModel,
  WorkersAIModelInfo
> = {
  [WORKERS_AI_MODELS.LLAMA_3_1_8B]: {
    id: WORKERS_AI_MODELS.LLAMA_3_1_8B,
    name: 'Llama 3.1 8B',
    description: 'Best quality, recommended for most use cases',
    speed: 'medium',
    quality: 'best',
    contextLength: 8192,
  },
  [WORKERS_AI_MODELS.LLAMA_3_2_1B]: {
    id: WORKERS_AI_MODELS.LLAMA_3_2_1B,
    name: 'Llama 3.2 1B',
    description: 'Fastest responses, good for simple tasks',
    speed: 'fast',
    quality: 'good',
    contextLength: 4096,
  },
  [WORKERS_AI_MODELS.LLAMA_3_2_3B]: {
    id: WORKERS_AI_MODELS.LLAMA_3_2_3B,
    name: 'Llama 3.2 3B',
    description: 'Balanced performance and quality',
    speed: 'fast',
    quality: 'better',
    contextLength: 4096,
  },
  [WORKERS_AI_MODELS.MISTRAL_7B]: {
    id: WORKERS_AI_MODELS.MISTRAL_7B,
    name: 'Mistral 7B',
    description: 'Alternative model with good quality',
    speed: 'medium',
    quality: 'better',
    contextLength: 8192,
  },
  [WORKERS_AI_MODELS.QWEN_1_5_14B]: {
    id: WORKERS_AI_MODELS.QWEN_1_5_14B,
    name: 'Qwen 1.5 14B',
    description: 'Largest model, best quality but slower',
    speed: 'slow',
    quality: 'best',
    contextLength: 8192,
  },
};

/**
 * Configuration options for the Workers AI chat component
 */
export interface WorkersAIChatConfig {
  /** API endpoint URL */
  apiEndpoint: string;
  /** Model to use */
  model: WorkersAIModel;
  /** System prompt */
  system?: string;
  /** Whether to include conversation history in requests */
  includeHistory: boolean;
  /** Maximum number of messages to keep in history */
  maxHistoryLength: number;
  /** Whether to show model selector */
  showModelSelector: boolean;
}

/**
 * Default configuration values
 */
export const DEFAULT_WORKERS_AI_CONFIG: WorkersAIChatConfig = {
  apiEndpoint: '/api/ai-chat',
  model: WORKERS_AI_MODELS.LLAMA_3_1_8B,
  includeHistory: true,
  maxHistoryLength: 10,
  showModelSelector: false,
};

/**
 * UI state for the Workers AI chat component
 */
export interface WorkersAIChatUIState {
  /** Whether a request is currently in progress */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Array of messages in the conversation */
  messages: ChatMessage[];
  /** Current input value */
  input: string;
  /** Currently selected model */
  selectedModel: WorkersAIModel;
}

/**
 * Workers AI API types (for reference, actual types from cf-typegen)
 */

/**
 * Workers AI message format
 */
export interface WorkersAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Workers AI text generation request
 */
export interface WorkersAITextGenerationRequest {
  messages: WorkersAIMessage[];
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
}

/**
 * Workers AI text generation response
 */
export interface WorkersAITextGenerationResponse {
  response: string;
  // Note: Actual structure may vary by model
}
