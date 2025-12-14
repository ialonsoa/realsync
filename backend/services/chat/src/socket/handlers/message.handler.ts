import { Server, Socket } from 'socket.io';
import { ChatService } from '../../services/chat.service';

export class MessageHandler {
  private chatService: ChatService;

  constructor(private io: Server, private socket: Socket) {
    this.chatService = new ChatService();
  }

  async sendMessage(data: {
    conversationId: string;
    body: string;
    mentions?: string[];
    parentMessageId?: string;
    tempId?: string;
  }) {
    try {
      const userId = this.socket.data.user.userId;

      // Create message
      const message = await this.chatService.createMessage({
        ...data,
        authorId: userId,
      });

      // Get conversation participants
      const conversation = await this.chatService.getConversation(data.conversationId);

      // Emit to all participants
      conversation.participants.forEach((participantId: string) => {
        this.io.to(`user:${participantId}`).emit('message:new', message);
      });

      // Acknowledge to sender
      this.socket.emit('message:sent', {
        tempId: data.tempId,
        message,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      this.socket.emit('message:error', {
        error: 'Failed to send message',
      });
    }
  }

  async markAsRead(data: { conversationId: string; messageIds: string[] }) {
    try {
      const userId = this.socket.data.user.userId;

      await this.chatService.markMessagesAsRead(
        data.conversationId,
        data.messageIds,
        userId
      );

      // Emit read receipt to conversation
      this.io.to(`conversation:${data.conversationId}`).emit('message:read', {
        messageIds: data.messageIds,
        userId,
        readAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}
