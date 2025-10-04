import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';

interface ChatPanelProps {
  previewId?: string;
  onSendMessage?: (message: string) => Promise<void>;
}

export default function ChatPanel({ previewId, onSendMessage }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your website chatbot assistant. Ask me anything about this website!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);

    try {
      if (onSendMessage) {
        await onSendMessage(input);
      } else {
        // Demo mode - simulate response
        setTimeout(() => {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `This is a demo response. In production, I would answer: "${input}"`,
            timestamp: new Date(),
            confidence: 0.85,
          };
          setMessages((prev) => [...prev, botMessage]);
          setSending(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setSending(false);
    }
  };

  const quickQuestions = [
    'What is this website about?',
    'How can I contact support?',
    'What are the main features?',
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Chat Testing</h3>
        <p className="text-sm text-gray-500">Test your chatbot responses</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {message.confidence && (
                  <span className="text-xs opacity-70">
                    · {Math.round(message.confidence * 100)}% confident
                  </span>
                )}
              </div>
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 border-opacity-20">
                  <p className="text-xs opacity-70 mb-1">Sources:</p>
                  {message.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs opacity-80 hover:opacity-100 underline block"
                    >
                      {source.page_title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {!previewId && messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question) => (
              <button
                key={question}
                onClick={() => setInput(question)}
                className="text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded-full px-3 py-1"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>

      {/* Analytics */}
      {messages.length > 2 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-around text-center text-xs text-gray-600">
            <div>
              <div className="font-semibold text-gray-900">{messages.length}</div>
              <div>Messages</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">~1.2s</div>
              <div>Avg Response</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">85%</div>
              <div>Confidence</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
