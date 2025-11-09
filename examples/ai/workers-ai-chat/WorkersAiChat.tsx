/**
 * Workers AI Chat Component
 *
 * A React chat interface powered by Cloudflare Workers AI.
 * Features edge-native AI inference with no external API dependencies.
 *
 * INTEGRATION INSTRUCTIONS:
 * 1. Copy this file to src/components/WorkersAiChat.tsx
 * 2. Copy types.ts to src/types/workers-ai-chat.ts (or adjust import path)
 * 3. Import and use in your App.tsx or other component
 * 4. Ensure the worker endpoint is set up at /api/ai-chat
 * 5. Ensure AI binding is added to wrangler.jsonc
 */

import { useState, useRef, useEffect } from 'react';
import type {
  ChatMessage,
  WorkersAIChatRequest,
  WorkersAIChatResponse,
  WorkersAIChatErrorResponse,
  WorkersAIChatUIState,
  WorkersAIModel,
  WORKERS_AI_MODELS,
  WORKERS_AI_MODEL_INFO,
} from './types';

/**
 * Main Workers AI Chat Component
 */
export default function WorkersAiChat() {
  // Component state
  const [state, setState] = useState<WorkersAIChatUIState>({
    isLoading: false,
    error: null,
    messages: [],
    input: '',
    selectedModel: '@cf/meta/llama-3.1-8b-instruct' as WorkersAIModel,
  });

  // Model selector visibility
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Reference to messages container for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages]);

  /**
   * Handles sending a message to Workers AI
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
      const requestBody: WorkersAIChatRequest = {
        message: userMessage,
        conversationHistory: state.messages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        model: state.selectedModel,
      };

      // Call API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data: WorkersAIChatResponse | WorkersAIChatErrorResponse =
        await response.json();

      // Handle error response
      if (!response.ok || 'error' in data) {
        const errorMessage = 'error' in data ? data.error : 'An error occurred';
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
      console.error('Workers AI chat error:', error);
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
      selectedModel: state.selectedModel,
    });
  };

  /**
   * Changes the AI model
   */
  const handleModelChange = (model: WorkersAIModel) => {
    setState((prev) => ({
      ...prev,
      selectedModel: model,
    }));
    setShowModelSelector(false);
  };

  // Get current model info
  const currentModelInfo =
    WORKERS_AI_MODEL_INFO[state.selectedModel as keyof typeof WORKERS_AI_MODEL_INFO];

  return (
    <div className="workers-ai-chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="header-left">
          <h2>Edge AI Chat</h2>
          <span className="model-badge" title={currentModelInfo?.description}>
            {currentModelInfo?.name || 'Workers AI'}
          </span>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="model-button"
            disabled={state.isLoading}
          >
            Change Model
          </button>
          {state.messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="clear-button"
              disabled={state.isLoading}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Model Selector */}
      {showModelSelector && (
        <div className="model-selector">
          <h3>Select AI Model</h3>
          <div className="model-list">
            {Object.values(WORKERS_AI_MODELS).map((modelId) => {
              const info = WORKERS_AI_MODEL_INFO[modelId as keyof typeof WORKERS_AI_MODEL_INFO];
              const isSelected = state.selectedModel === modelId;

              return (
                <button
                  key={modelId}
                  onClick={() => handleModelChange(modelId as WorkersAIModel)}
                  className={`model-option ${isSelected ? 'selected' : ''}`}
                >
                  <div className="model-option-name">{info.name}</div>
                  <div className="model-option-desc">{info.description}</div>
                  <div className="model-option-meta">
                    <span className="model-speed">Speed: {info.speed}</span>
                    <span className="model-quality">Quality: {info.quality}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="messages-container">
        {state.messages.length === 0 && (
          <div className="empty-state">
            <p>Start a conversation with Workers AI!</p>
            <p className="empty-state-hint">
              Powered by {currentModelInfo?.name} - running at the edge
            </p>
          </div>
        )}

        {state.messages.map((message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className="message-role">
              {message.role === 'user' ? 'You' : 'AI'}
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
            <div className="message-role">AI</div>
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
          {state.isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>

      {/* Inline Styles (for demo - move to CSS file in production) */}
      <style>{`
        .workers-ai-chat-container {
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-header h2 {
          margin: 0;
          font-size: 20px;
        }

        .model-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .model-button {
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .model-button:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.3);
        }

        .clear-button {
          padding: 6px 12px;
          background: rgba(220, 53, 69, 0.9);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .clear-button:hover:not(:disabled) {
          background: #dc3545;
        }

        .clear-button:disabled,
        .model-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .model-selector {
          padding: 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .model-selector h3 {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
        }

        .model-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .model-option {
          padding: 12px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
        }

        .model-option:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .model-option.selected {
          border-color: #667eea;
          background: #667eea;
          color: white;
        }

        .model-option-name {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .model-option-desc {
          font-size: 13px;
          opacity: 0.8;
          margin-bottom: 6px;
        }

        .model-option-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          opacity: 0.7;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          border-color: #667eea;
        }

        .message-input:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .send-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .send-button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .send-button:disabled {
          opacity: 0.5;
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
 * import WorkersAiChat from './components/WorkersAiChat';
 *
 * function App() {
 *   return (
 *     <div>
 *       <h1>Edge AI Application</h1>
 *       <WorkersAiChat />
 *     </div>
 *   );
 * }
 * ```
 */
