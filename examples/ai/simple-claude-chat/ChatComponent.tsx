/**
 * Simple Claude Chat Component
 *
 * A basic React chat interface for interacting with Claude AI.
 * Features non-streaming responses with loading states and error handling.
 *
 * INTEGRATION INSTRUCTIONS:
 * 1. Copy this file to src/components/ChatComponent.tsx
 * 2. Copy types.ts to src/types/chat.ts (or adjust import path)
 * 3. Import and use in your App.tsx or other component
 * 4. Ensure the worker endpoint is set up at /api/chat
 */

import { useState, useRef, useEffect } from 'react';
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ChatErrorResponse,
  ChatUIState,
} from './types';

/**
 * Main Chat Component
 */
export default function ChatComponent() {
  // Component state
  const [state, setState] = useState<ChatUIState>({
    isLoading: false,
    error: null,
    messages: [],
    input: '',
  });

  // Reference to messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  /**
   * Handles sending a message to the API
   */
  const handleSendMessage = async () => {
    const userMessage = state.input.trim();

    // Validate input
    if (!userMessage) return;
    if (state.isLoading) return;

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
      isLoading: true,
      error: null,
    }));

    try {
      // Build request payload
      const requestBody: ChatRequest = {
        message: userMessage,
        conversationHistory: state.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      };

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: ChatResponse | ChatErrorResponse = await response.json();

      // Handle error response
      if (!response.ok || 'error' in data) {
        const errorMessage =
          'error' in data ? data.error : 'An error occurred';
        throw new Error(errorMessage);
      }

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        id: crypto.randomUUID(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Chat error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send message. Please try again.',
      }));
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
    setState({
      isLoading: false,
      error: null,
      messages: [],
      input: '',
    });
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <h2>Claude Chat</h2>
        {state.messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="clear-button"
            disabled={state.isLoading}
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {state.messages.length === 0 && (
          <div className="empty-state">
            <p>Start a conversation with Claude!</p>
            <p className="empty-state-hint">
              Try asking a question or requesting help with something.
            </p>
          </div>
        )}

        {state.messages.map((message) => (
          <div
            key={message.id}
            className={`message message-${message.role}`}
          >
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

        {/* Loading indicator */}
        {state.isLoading && (
          <div className="message message-assistant">
            <div className="message-role">Claude</div>
            <div className="message-content">
              <div className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </div>
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
          disabled={state.isLoading}
          className="message-input"
        />
        <button
          onClick={handleSendMessage}
          disabled={state.isLoading || !state.input.trim()}
          className="send-button"
        >
          {state.isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Inline Styles (for demo - move to CSS file in production) */}
      <style>{`
        .chat-container {
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

        .clear-button {
          padding: 6px 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .clear-button:hover:not(:disabled) {
          background: #c82333;
        }

        .clear-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
        }

        .message-user .message-content {
          background: #007bff;
          color: white;
        }

        .message-assistant .message-content {
          background: #f1f3f4;
          color: #333;
        }

        .message-timestamp {
          font-size: 11px;
          color: #999;
        }

        .loading-dots {
          display: flex;
          gap: 4px;
        }

        .loading-dots span {
          animation: blink 1.4s infinite both;
        }

        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes blink {
          0%, 80%, 100% {
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
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
 * import ChatComponent from './components/ChatComponent';
 *
 * function App() {
 *   return (
 *     <div>
 *       <h1>My AI App</h1>
 *       <ChatComponent />
 *     </div>
 *   );
 * }
 * ```
 */
