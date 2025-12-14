import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class ConversationService {
  // Create property chat (3-way: buyer, seller, agent)
  async createPropertyChat(data: {
    propertyId: string;
    transactionId: string;
    agentId: string;
    buyerId?: string;
    ownerId?: string;
  }) {
    const participants = [data.agentId, data.buyerId, data.ownerId].filter(Boolean);

    const [conversation] = await db('conversations')
      .insert({
        type: 'PROPERTY_CHAT',
        property_id: data.propertyId,
        transaction_id: data.transactionId,
        participants: JSON.stringify(participants),
      })
      .returning('*');

    return {
      ...conversation,
      participants: JSON.parse(conversation.participants),
    };
  }

  // Create direct message conversation (1-on-1)
  async createDirectMessage(data: {
    user1Id: string;
    user2Id: string;
  }) {
    // Check if conversation already exists
    const existing = await db('conversations')
      .where('type', 'DIRECT_MESSAGE')
      .whereRaw(`participants @> ?`, [JSON.stringify([data.user1Id])])
      .whereRaw(`participants @> ?`, [JSON.stringify([data.user2Id])])
      .first();

    if (existing) {
      return {
        ...existing,
        participants: JSON.parse(existing.participants),
      };
    }

    const [conversation] = await db('conversations')
      .insert({
        type: 'DIRECT_MESSAGE',
        participants: JSON.stringify([data.user1Id, data.user2Id]),
      })
      .returning('*');

    return {
      ...conversation,
      participants: JSON.parse(conversation.participants),
    };
  }

  // Get user's conversations
  async getUserConversations(userId: string, type?: string) {
    let query = db('conversations')
      .whereRaw(`participants @> ?`, [JSON.stringify([userId])])
      .whereNull('deleted_at')
      .orderBy('last_activity_at', 'desc');

    if (type) {
      query = query.where('type', type);
    }

    const conversations = await query;

    // Enrich with last message and unread count
    for (const conv of conversations) {
      conv.participants = JSON.parse(conv.participants);

      if (conv.last_message_id) {
        conv.last_message = await db('messages')
          .where('id', conv.last_message_id)
          .first();
      }

      // Count unread messages
      const messages = await db('messages')
        .where('conversation_id', conv.id)
        .whereNull('deleted_at');

      conv.unread_count = messages.filter((msg: any) => {
        const readBy = JSON.parse(msg.read_by || '[]');
        return !readBy.find((r: any) => r.user_id === userId) && msg.author_id !== userId;
      }).length;
    }

    return conversations;
  }
}
