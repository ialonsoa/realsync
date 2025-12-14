import { Server, Socket } from 'socket.io';
import db from '../../config/database';

export class TypingHandler {
  constructor(private _io: Server, private socket: Socket) {}

  async startTyping(data: { conversationId: string }) {
    try {
      const userId = this.socket.data.user.userId;

      // Get user name
      const user = await db('users')
        .where('id', userId)
        .first();

      const userName = user ? `${user.first_name} ${user.last_name}` : 'User';

      // Emit to conversation (except sender)
      this.socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
        conversationId: data.conversationId,
        user: {
          userId,
          userName,
        },
      });
    } catch (error) {
      console.error('Error in startTyping:', error);
    }
  }

  async stopTyping(data: { conversationId: string }) {
    try {
      const userId = this.socket.data.user.userId;

      // Emit to conversation (except sender)
      this.socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        conversationId: data.conversationId,
        userId,
      });
    } catch (error) {
      console.error('Error in stopTyping:', error);
    }
  }
}
