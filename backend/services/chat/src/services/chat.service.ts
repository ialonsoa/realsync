import db from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export class ChatService {
  async createMessage(data: {
    conversationId: string;
    authorId: string;
    body: string;
    mentions?: string[];
    parentMessageId?: string;
  }) {
    const message = {
      id: uuidv4(),
      conversation_id: data.conversationId,
      author_id: data.authorId,
      body: data.body,
      attachments: JSON.stringify([]),
      mentions: JSON.stringify(data.mentions || []),
      reactions: JSON.stringify({}),
      read_by: JSON.stringify([]),
      parent_message_id: data.parentMessageId || null,
      is_system_message: false,
      is_edited: false,
    };

    const [createdMessage] = await db('messages')
      .insert(message)
      .returning('*');

    // Update conversation last_activity
    await db('conversations')
      .where('id', data.conversationId)
      .update({
        last_message_id: createdMessage.id,
        last_activity_at: db.fn.now(),
      });

    return createdMessage;
  }

  async getConversation(conversationId: string) {
    const conversation = await db('conversations')
      .where('id', conversationId)
      .first();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return {
      ...conversation,
      participants: JSON.parse(conversation.participants),
    };
  }

  async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    before?: string
  ) {
    let query = db('messages')
      .where('conversation_id', conversationId)
      .whereNull('deleted_at')
      .orderBy('created_at', 'desc')
      .limit(limit);

    if (before) {
      const beforeMessage = await db('messages')
        .where('id', before)
        .first();

      if (beforeMessage) {
        query = query.where('created_at', '<', beforeMessage.created_at);
      }
    }

    const messages = await query;
    return messages.reverse(); // Return in chronological order
  }

  async markMessagesAsRead(
    _conversationId: string,
    messageIds: string[],
    userId: string
  ) {
    const readEntry = { user_id: userId, read_at: new Date().toISOString() };

    for (const messageId of messageIds) {
      const message = await db('messages')
        .where('id', messageId)
        .first();

      if (message) {
        const readBy = JSON.parse(message.read_by || '[]');

        // Check if already read by this user
        if (!readBy.find((r: any) => r.user_id === userId)) {
          readBy.push(readEntry);

          await db('messages')
            .where('id', messageId)
            .update({
              read_by: JSON.stringify(readBy),
            });
        }
      }
    }
  }
}
