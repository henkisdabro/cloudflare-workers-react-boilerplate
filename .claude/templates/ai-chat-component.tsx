/**
 * AI Chat Component
 *
 * A production-ready React chat component with:
 * - Message history display
 * - Input field with keyboard shortcuts
 * - Loading states
 * - Error handling
 * - TypeScript types
 *
 * Usage:
 *   import AIChat from './components/AIChat';
 *   <AIChat />
 */

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

interface AIChatProps {
  apiEndpoint?: string;
  placeholder?: string;
  maxMessages?: number;
  showTimestamps?: boolean;
  className?: string;
}

export default function AIChat({
  apiEndpoint = '/api/chat',
  placeholder = 'Type your message...',
  maxMessages = 100,
  showTimestamps = false,
  className = '',
}: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Build conversation history (exclude timestamps for API)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ChatResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || '',
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        // Enforce max messages limit
        return updated.length > maxMessages
          ? updated.slice(-maxMessages)
          : updated;
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Chat error:', err);

      // Remove the user message if request failed
      setMessages(prev => prev.slice(0, -1));
      // Restore input
      setInput(userMessage.content);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`ai-chat-container ${className}`} style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{ margin: 0 }}>AI Chat</h2>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div
        className="messages"
        style={{
          height: '400px',
          overflowY: 'auto',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
          backgroundColor: '#fafafa',
        }}
      >
        {messages.length === 0 && !loading && (
          <p style={{ color: '#999', textAlign: 'center', marginTop: '100px' }}>
            Start a conversation...
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? '#007bff' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#000',
                border: msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '4px',
                opacity: 0.8,
              }}>
                {msg.role === 'user' ? 'You' : 'AI'}
                {showTimestamps && (
                  <span style={{ marginLeft: '8px', fontWeight: 400 }}>
                    {formatTime(msg.timestamp)}
                  </span>
                )}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '16px',
          }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                color: '#666',
                fontStyle: 'italic',
              }}
            >
              AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
            border: '1px solid #fcc',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#007bff'}
          onBlur={(e) => e.target.style.borderColor = '#ccc'}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading || !input.trim() ? '#ccc' : '#007bff',
            color: '#fff',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Hint Text */}
      <p style={{
        fontSize: '12px',
        color: '#999',
        marginTop: '8px',
        textAlign: 'center',
      }}>
        Press Enter to send
      </p>
    </div>
  );
}
