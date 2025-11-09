/**
 * Streaming Chat Component
 *
 * A React chat interface with real-time streaming responses using Server-Sent Events (SSE).
 * Features character-by-character streaming for better user experience.
 *
 * INTEGRATION INSTRUCTIONS:
 * 1. Copy this file to src/components/StreamingChat.tsx
 * 2. Copy types.ts to src/types/streaming-chat.ts (or adjust import path)
 * 3. Import and use in your App.tsx or other component
 * 4. Ensure the worker endpoint is set up at /api/chat-stream
 */

import { useState, useRef, useEffect } from 'react';
import type {
  ChatMessage,
  StreamingChatRequest,
  StreamEvent,
  StreamingChatUIState,
} from './types';

/**
 * Main Streaming Chat Component
 */
export default function StreamingChat() {
  // Component state
  const [state, setState] = useState<StreamingChatUIState>({
    isStreaming: false,
    error: null,
    messages: [],
    input: '',
    streamingContent: '',
    isReady: true,
  });

  // Reference to abort controller for cancelling streams
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reference to messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages or streaming content arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.streamingContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any active stream when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Handles sending a message and receiving streaming response
   */
  const handleSendMessage = async () => {
    const userMessage = state.input.trim();

    // Validate input
    if (!userMessage) return;
    if (state.isStreaming) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
      id: crypto.randomUUID(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      input: '',
      isStreaming: true,
      error: null,
      streamingContent: '',
    }));

    try {
      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Build request payload
      const requestBody: StreamingChatRequest = {
        message: userMessage,
        conversationHistory: state.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      // Make streaming request
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Process SSE stream
      await processStream(response);
    } catch (error) {
      // Handle abort separately (not an error)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream aborted by user');
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          streamingContent: '',
        }));
        return;
      }

      // Handle other errors
      console.error('Streaming error:', error);
      setState((prev) => ({
        ...prev,
        isStreaming: false,
        streamingContent: '',
        error:
          error instanceof Error
            ? error.message
            : 'Failed to stream response. Please try again.',
      }));
    } finally {
      abortControllerRef.current = null;
    }
  };

  /**
   * Processes the SSE stream from the server
   */
  const processStream = async (response: Response) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode chunk
        buffer += decoder.decode(value, { stream: true });

        // Process complete events (events are separated by \n\n)
        const events = buffer.split('\n\n');

        // Keep last incomplete event in buffer
        buffer = events.pop() || '';

        // Process each complete event
        for (const eventText of events) {
          if (!eventText.trim()) continue;

          // Parse SSE format: "data: {json}"
          if (eventText.startsWith('data: ')) {
            try {
              const jsonData = eventText.slice(6); // Remove "data: " prefix
              const event: StreamEvent = JSON.parse(jsonData);

              if (event.type === 'content') {
                // Append text to streaming content
                fullResponse += event.text;
                setState((prev) => ({
                  ...prev,
                  streamingContent: fullResponse,
                }));
              } else if (event.type === 'done') {
                // Stream complete - add assistant message
                const assistantMessage: ChatMessage = {
                  role: 'assistant',
                  content: fullResponse,
                  timestamp: Date.now(),
                  id: crypto.randomUUID(),
                };

                setState((prev) => ({
                  ...prev,
                  messages: [...prev.messages, assistantMessage],
                  isStreaming: false,
                  streamingContent: '',
                }));
              } else if (event.type === 'error') {
                // Error event
                throw new Error(event.error);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE event:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  /**
   * Handles Enter key press in input
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Clears the conversation
   */
  const handleClearChat = () => {
    // Cancel any active stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      isStreaming: false,
      error: null,
      messages: [],
      input: '',
      streamingContent: '',
      isReady: true,
    });
  };

  /**
   * Stops the current streaming response
   */
  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="streaming-chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <h2>Claude Chat (Streaming)</h2>
        <div className="header-actions">
          {state.isStreaming && (
            <button
              onClick={handleStopStream}
              className="stop-button"
            >
              Stop
            </button>
          )}
          {state.messages.length > 0 && !state.isStreaming && (
            <button onClick={handleClearChat} className="clear-button">
              Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {state.messages.length === 0 && !state.isStreaming && (
          <div className="empty-state">
            <p>Start a conversation with Claude!</p>
            <p className="empty-state-hint">
              Responses will stream in real-time for better experience.
            </p>
          </div>
        )}

        {state.messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className="message-role">
              {message.role === 'user' ? 'You' : 'Claude'}
            </div>
            <div className="message-content">{message.content}</div>
            {message.timestamp && (
              <div className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {state.isStreaming && (
          <div className="message message-assistant streaming">
            <div className="message-role">Claude</div>
            <div className="message-content">
              {state.streamingContent}
              <span className="cursor">▊</span>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="error-message">
          <strong>Error:</strong> {state.error}
          <button
            onClick={() => setState((prev) => ({ ...prev, error: null }))}
            className="error-close"
          >
            &times;
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="input-container">
        <input
          type="text"
          value={state.input}
          onChange={(e) =>
            setState((prev) => ({ ...prev, input: e.target.value }))
          }
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={state.isStreaming}
          className="message-input"
        />
        <button
          onClick={handleSendMessage}
          disabled={state.isStreaming || !state.input.trim()}
          className="send-button"
        >
          {state.isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </div>

      {/* Inline Styles (for demo - move to CSS file in production) */}
      <style>{`
        .streaming-chat-container {
          display: flex;
          flex-direction: column;
          max-width: 800px;
          margin: 0 auto;
          height: 600px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fff;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .chat-header h2 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .stop-button {
          padding: 6px 12px;
          background: #ffc107;
          color: #000;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .stop-button:hover {
          background: #e0a800;
        }

        .clear-button {
          padding: 6px 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .clear-button:hover {
          background: #c82333;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-state {
          text-align: center;
          color: #666;
          padding: 40px 20px;
        }

        .empty-state p {
          margin: 8px 0;
        }

        .empty-state-hint {
          font-size: 14px;
          color: #999;
        }

        .message {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .message-user {
          align-items: flex-end;
        }

        .message-assistant {
          align-items: flex-start;
        }

        .message-role {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          text-transform: uppercase;
        }

        .message-content {
          padding: 12px 16px;
          border-radius: 8px;
          max-width: 70%;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .message-user .message-content {
          background: #007bff;
          color: white;
        }

        .message-assistant .message-content {
          background: #f1f3f4;
          color: #333;
        }

        .message-assistant.streaming .message-content {
          background: #e8f4f8;
          border: 1px solid #b3e5fc;
        }

        .cursor {
          animation: blink 1s infinite;
          margin-left: 2px;
        }

        @keyframes blink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }

        .message-timestamp {
          font-size: 11px;
          color: #999;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 12px 16px;
          margin: 0 16px;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #721c24;
        }

        .input-container {
          display: flex;
          gap: 8px;
          padding: 16px;
          border-top: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .message-input {
          flex: 1;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .message-input:focus {
          outline: none;
          border-color: #007bff;
        }

        .message-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .send-button {
          padding: 12px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .send-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .send-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

/**
 * USAGE EXAMPLE:
 *
 * ```tsx
 * // In your App.tsx or other component
 * import StreamingChat from './components/StreamingChat';
 *
 * function App() {
 *   return (
 *     <div>
 *       <h1>AI Chat App</h1>
 *       <StreamingChat />
 *     </div>
 *   );
 * }
 * ```
 */
