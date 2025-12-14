import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  conversation_id: string;
  author_id: string;
  body: string;
  attachments?: string[];
  mentions?: string[];
  reactions?: Record<string, string[]>;
  read_by?: Array<{ user_id: string; read_at: string }>;
  created_at: string;
  is_system_message?: boolean;
}

interface Conversation {
  id: string;
  type: 'PROPERTY_CHAT' | 'DIRECT_MESSAGE' | 'CLIENT_NOTE';
  property_id?: string;
  transaction_id?: string;
  participants: string[];
  name?: string;
  last_message?: Message;
  last_activity_at: string;
  unread_count: number;
}

interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatState {
  socket: Socket | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  typingUsers: Record<string, TypingUser[]>;
  isConnected: boolean;

  initialize: (token: string) => void;
  disconnect: () => void;
  selectConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, body: string) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  markAsRead: (conversationId: string, messageIds: string[]) => void;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  conversations: [],
  messages: {},
  activeConversationId: null,
  typingUsers: {},
  isConnected: false,

  initialize: (token: string) => {
    const socket = io(import.meta.env.VITE_CHAT_SERVICE_URL || 'http://localhost:8002', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Chat connected');
      set({ isConnected: true });
      get().loadConversations();
    });

    socket.on('disconnect', () => {
      console.log('Chat disconnected');
      set({ isConnected: false });
    });

    // Message events
    socket.on('message:new', (message: Message) => {
      const { messages, activeConversationId } = get();
      const convMessages = messages[message.conversation_id] || [];

      set({
        messages: {
          ...messages,
          [message.conversation_id]: [...convMessages, message],
        },
      });

      // Update conversation last message
      const { conversations } = get();
      const updatedConversations = conversations.map((conv) =>
        conv.id === message.conversation_id
          ? { ...conv, last_message: message, last_activity_at: message.created_at }
          : conv
      );
      set({ conversations: updatedConversations });

      // Auto-mark as read if conversation is active
      if (activeConversationId === message.conversation_id) {
        get().markAsRead(message.conversation_id, [message.id]);
      }
    });

    socket.on('message:read', (data: { messageIds: string[]; userId: string; readAt: string }) => {
      const { messages } = get();
      const updatedMessages = { ...messages };

      Object.keys(updatedMessages).forEach((convId) => {
        updatedMessages[convId] = updatedMessages[convId].map((msg) => {
          if (data.messageIds.includes(msg.id)) {
            const readBy = msg.read_by || [];
            return {
              ...msg,
              read_by: [...readBy, { user_id: data.userId, read_at: data.readAt }],
            };
          }
          return msg;
        });
      });

      set({ messages: updatedMessages });
    });

    // Typing events
    socket.on('typing:start', (data: { conversationId: string; user: TypingUser }) => {
      const { typingUsers } = get();
      const convTyping = typingUsers[data.conversationId] || [];

      if (!convTyping.find((u) => u.userId === data.user.userId)) {
        set({
          typingUsers: {
            ...typingUsers,
            [data.conversationId]: [...convTyping, data.user],
          },
        });
      }
    });

    socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      const { typingUsers } = get();
      const convTyping = typingUsers[data.conversationId] || [];

      set({
        typingUsers: {
          ...typingUsers,
          [data.conversationId]: convTyping.filter((u) => u.userId !== data.userId),
        },
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
    }
    set({ socket: null, isConnected: false });
  },

  selectConversation: (conversationId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('conversation:join', { conversationId });
    }
    set({ activeConversationId: conversationId });
    get().loadMessages(conversationId);
  },

  sendMessage: (conversationId: string, body: string) => {
    const { socket } = get();
    if (!socket) return;

    const tempId = `temp-${Date.now()}`;

    socket.emit('message:send', {
      conversationId,
      body,
      tempId,
    });
  },

  loadConversations: async () => {
    try {
      const response = await fetch('http://localhost:8002/api/v1/conversations?userId=temp-user-id');
      const conversations = await response.json();
      set({ conversations });
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  },

  loadMessages: async (conversationId: string) => {
    try {
      const response = await fetch(`http://localhost:8002/api/v1/conversations/${conversationId}/messages`);
      const messages = await response.json();
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        },
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  },

  markAsRead: (conversationId: string, messageIds: string[]) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit('message:read', { conversationId, messageIds });
  },

  startTyping: (conversationId: string) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit('typing:start', { conversationId });
  },

  stopTyping: (conversationId: string) => {
    const { socket } = get();
    if (!socket) return;

    socket.emit('typing:stop', { conversationId });
  },
}));
