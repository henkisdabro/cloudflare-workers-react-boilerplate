/**
 * Type definitions for Streaming Chat
 *
 * These types ensure type safety for streaming chat implementation
 * using Server-Sent Events (SSE) for real-time responses.
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
  /** Whether this message is currently being streamed */
  isStreaming?: boolean;
}

/**
 * Request body for the /api/chat-stream endpoint
 */
export interface StreamingChatRequest {
  /** The user's message to send to Claude */
  message: string;
  /** Optional conversation history for context */
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
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
 * Server-Sent Event (SSE) data types
 */
export type StreamEvent =
  | ContentStreamEvent
  | DoneStreamEvent
  | ErrorStreamEvent;

/**
 * Content chunk event during streaming
 */
export interface ContentStreamEvent {
  /** Event type identifier */
  type: 'content';
  /** Text content chunk */
  text: string;
  /** Optional index for ordering chunks */
  index?: number;
}

/**
 * Stream completion event
 */
export interface DoneStreamEvent {
  /** Event type identifier */
  type: 'done';
  /** Model used for the response */
  model: string;
  /** Token usage information */
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  /** Stop reason */
  stop_reason?: 'end_turn' | 'max_tokens' | 'stop_sequence';
}

/**
 * Stream error event
 */
export interface ErrorStreamEvent {
  /** Event type identifier */
  type: 'error';
  /** Error message */
  error: string;
  /** Optional error details */
  details?: string;
}

/**
 * Type guard for content events
 */
export function isContentEvent(
  event: StreamEvent
): event is ContentStreamEvent {
  return event.type === 'content';
}

/**
 * Type guard for done events
 */
export function isDoneEvent(event: StreamEvent): event is DoneStreamEvent {
  return event.type === 'done';
}

/**
 * Type guard for error events
 */
export function isErrorEvent(event: StreamEvent): event is ErrorStreamEvent {
  return event.type === 'error';
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
 * Configuration options for the streaming chat component
 */
export interface StreamingChatConfig {
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
  /** Whether to auto-scroll to new messages */
  autoScroll: boolean;
}

/**
 * Default configuration values
 */
export const DEFAULT_STREAMING_CONFIG: StreamingChatConfig = {
  apiEndpoint: '/api/chat-stream',
  model: CLAUDE_MODELS.SONNET_3_5,
  maxTokens: 2048,
  temperature: 0.7,
  includeHistory: true,
  maxHistoryLength: 10,
  autoScroll: true,
};

/**
 * UI state for the streaming chat component
 */
export interface StreamingChatUIState {
  /** Whether a stream is currently active */
  isStreaming: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Array of messages in the conversation */
  messages: ChatMessage[];
  /** Current input value */
  input: string;
  /** Current streaming message content */
  streamingContent: string;
  /** Whether the component is mounted and ready */
  isReady: boolean;
}

/**
 * SSE Connection state
 */
export interface SSEConnectionState {
  /** Whether connection is active */
  isConnected: boolean;
  /** Current ReadableStreamDefaultReader if active */
  reader: ReadableStreamDefaultReader<Uint8Array> | null;
  /** Abort controller for cancelling stream */
  abortController: AbortController | null;
  /** Last event timestamp */
  lastEventTime: number;
  /** Reconnection attempt count */
  reconnectAttempts: number;
}

/**
 * Streaming statistics for debugging/monitoring
 */
export interface StreamingStats {
  /** Total characters received */
  totalChars: number;
  /** Total events received */
  totalEvents: number;
  /** Stream start time */
  startTime: number;
  /** Stream end time */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Average characters per second */
  charsPerSecond?: number;
}
