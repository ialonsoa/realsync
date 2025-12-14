import { useEffect } from 'react';
import { useChatStore } from '../../store/chat';
import { useAuthStore } from '../../store/auth';
import ConversationList from '../../components/chat/ConversationList';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';

export default function ChatPage() {
  const { session } = useAuthStore();
  const { initialize, disconnect, activeConversationId, isConnected, messages, typingUsers } = useChatStore();

  useEffect(() => {
    if (session?.access_token) {
      initialize(session.access_token);
    }

    return () => {
      disconnect();
    };
  }, [session, initialize, disconnect]);

  const activeMessages = activeConversationId ? messages[activeConversationId] || [] : [];
  const activeTypingUsers = activeConversationId ? typingUsers[activeConversationId] || [] : [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-500">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="flex-1 flex min-h-0">
        {/* Conversations Sidebar */}
        <ConversationList className="w-80 border-r bg-white" />

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConversationId ? (
            <>
              <MessageList messages={activeMessages} typingUsers={activeTypingUsers} />
              <MessageInput conversationId={activeConversationId} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <h3 className="text-lg font-medium">No hay conversación seleccionada</h3>
                <p className="text-sm mt-2">Selecciona una conversación de la lista</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
