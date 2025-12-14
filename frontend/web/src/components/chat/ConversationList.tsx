import { useChatStore } from '../../store/chat';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ConversationListProps {
  className?: string;
}

export default function ConversationList({ className }: ConversationListProps) {
  const { conversations, selectConversation, activeConversationId } = useChatStore();

  const propertyChats = conversations.filter((c) => c.type === 'PROPERTY_CHAT');
  const directMessages = conversations.filter((c) => c.type === 'DIRECT_MESSAGE');

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Conversaciones</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Property Chats */}
        {propertyChats.length > 0 && (
          <div className="px-2 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">
              Chats de Propiedades
            </h3>
            {propertyChats.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  activeConversationId === conversation.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        Propiedad Chat
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.last_message.body}
                      </p>
                    )}
                    {conversation.last_activity_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(conversation.last_activity_at), 'PPp', { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Direct Messages */}
        {directMessages.length > 0 && (
          <div className="px-2 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase px-2 mb-2">
              Mensajes Directos
            </h3>
            {directMessages.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                className={`w-full text-left px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors ${
                  activeConversationId === conversation.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {conversation.name || 'Conversación'}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span className="ml-2 bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                          {conversation.unread_count}
                        </span>
                      )}
                    </div>
                    {conversation.last_message && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.last_message.body}
                      </p>
                    )}
                    {conversation.last_activity_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(conversation.last_activity_at), 'PPp', { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {conversations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <ChatBubbleLeftIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm">No hay conversaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
