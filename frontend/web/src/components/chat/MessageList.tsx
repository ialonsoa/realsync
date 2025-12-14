import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/auth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Message {
  id: string;
  conversation_id: string;
  author_id: string;
  body: string;
  created_at: string;
  is_system_message?: boolean;
  read_by?: Array<{ user_id: string; read_at: string }>;
}

interface TypingUser {
  userId: string;
  userName: string;
}

interface MessageListProps {
  messages: Message[];
  typingUsers: TypingUser[];
}

export default function MessageList({ messages, typingUsers }: MessageListProps) {
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.author_id === user?.id;
        const isSystemMessage = message.is_system_message;

        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
              isSystemMessage ? 'justify-center' : ''
            }`}
          >
            {isSystemMessage ? (
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-xs text-center max-w-md">
                {message.body}
              </div>
            ) : (
              <div
                className={`max-w-md ${
                  isOwnMessage
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg px-4 py-3`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <span
                    className={`text-xs ${
                      isOwnMessage ? 'text-primary-200' : 'text-gray-400'
                    }`}
                  >
                    {format(new Date(message.created_at), 'p', { locale: es })}
                  </span>
                  {isOwnMessage && message.read_by && message.read_by.length > 0 && (
                    <span className="text-xs text-primary-200">✓✓</span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-md">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-gray-500">
                {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'está' : 'están'} escribiendo...
              </span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
