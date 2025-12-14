import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

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
  participants: string[];
  name?: string;
  last_message?: Message;
  last_activity_at: string;
  unread_count: number;
}

interface ChatState {
  channel: RealtimeChannel | null;
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  activeConversationId: string | null;
  isConnected: boolean;
  currentUserId: string | null;

  initialize: (userId: string) => void;
  disconnect: () => void;
  selectConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  markAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  channel: null,
  conversations: [],
  messages: {},
  activeConversationId: null,
  isConnected: false,
  currentUserId: null,

  initialize: (userId: string) => {
    console.log('Initializing chat with Supabase Realtime for user:', userId);

    set({ currentUserId: userId, isConnected: true });

    // Load initial data
    get().loadConversations();

    // Subscribe to messages table for real-time updates
    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;

          const { messages, activeConversationId } = get();
          const convMessages = messages[newMessage.conversation_id] || [];

          // Add message to state
          set({
            messages: {
              ...messages,
              [newMessage.conversation_id]: [...convMessages, newMessage],
            },
          });

          // Update conversation last message
          const { conversations } = get();
          const updatedConversations = conversations.map((conv) =>
            conv.id === newMessage.conversation_id
              ? {
                  ...conv,
                  last_message: newMessage,
                  last_activity_at: newMessage.created_at,
                  unread_count: activeConversationId === newMessage.conversation_id ? 0 : conv.unread_count + 1
                }
              : conv
          );
          set({ conversations: updatedConversations });

          // Auto-mark as read if conversation is active
          if (activeConversationId === newMessage.conversation_id && newMessage.author_id !== userId) {
            get().markAsRead(newMessage.conversation_id, [newMessage.id]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Message updated:', payload);
          const updatedMessage = payload.new as Message;

          const { messages } = get();
          const convMessages = messages[updatedMessage.conversation_id] || [];

          set({
            messages: {
              ...messages,
              [updatedMessage.conversation_id]: convMessages.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              ),
            },
          });
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime status:', status);
        set({ isConnected: status === 'SUBSCRIBED' });
      });

    set({ channel });
  },

  disconnect: () => {
    const { channel } = get();
    if (channel) {
      supabase.removeChannel(channel);
    }
    set({ channel: null, isConnected: false });
  },

  selectConversation: (conversationId: string) => {
    set({ activeConversationId: conversationId });
    get().loadMessages(conversationId);

    // Mark existing messages as read
    const { messages } = get();
    const convMessages = messages[conversationId] || [];
    const unreadMessageIds = convMessages
      .filter(msg => msg.author_id !== get().currentUserId)
      .filter(msg => !msg.read_by?.some(r => r.user_id === get().currentUserId))
      .map(msg => msg.id);

    if (unreadMessageIds.length > 0) {
      get().markAsRead(conversationId, unreadMessageIds);
    }
  },

  sendMessage: async (conversationId: string, body: string) => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          author_id: currentUserId,
          body,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      // Update conversation last_activity_at
      await supabase
        .from('conversations')
        .update({
          last_activity_at: new Date().toISOString(),
          last_message_id: data.id
        })
        .eq('id', conversationId);

      console.log('Message sent:', data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  },

  loadConversations: async () => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    try {
      // Get conversations where user is a participant
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participants', [currentUserId])
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }

      // For each conversation, get last message and count unread
      const conversationsWithData = await Promise.all(
        (conversations || []).map(async (conv) => {
          // Get last message if there's a last_message_id
          let lastMessage = null;
          if (conv.last_message_id) {
            const { data } = await supabase
              .from('messages')
              .select('*')
              .eq('id', conv.last_message_id)
              .single();
            lastMessage = data;
          }

          // Count unread messages (simple version)
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('author_id', currentUserId);

          return {
            ...conv,
            last_message: lastMessage,
            unread_count: count || 0,
          };
        })
      );

      set({ conversations: conversationsWithData });
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  },

  loadMessages: async (conversationId: string) => {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages || [],
        },
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  },

  markAsRead: async (conversationId: string, messageIds: string[]) => {
    const { currentUserId } = get();
    if (!currentUserId || messageIds.length === 0) return;

    try {
      const readEntry = { user_id: currentUserId, read_at: new Date().toISOString() };

      for (const messageId of messageIds) {
        // Get current message
        const { data: message } = await supabase
          .from('messages')
          .select('read_by')
          .eq('id', messageId)
          .single();

        if (message) {
          const readBy = message.read_by || [];

          // Check if already read by this user
          if (!readBy.find((r: any) => r.user_id === currentUserId)) {
            readBy.push(readEntry);

            await supabase
              .from('messages')
              .update({ read_by: readBy })
              .eq('id', messageId);
          }
        }
      }

      // Update local state
      const { conversations } = get();
      set({
        conversations: conversations.map((conv) =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        ),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },
}));
