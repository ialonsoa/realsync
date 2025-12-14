import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './config/redis';
import { authenticateSocket } from './socket/middleware/auth.middleware';
import { MessageHandler } from './socket/handlers/message.handler';
import { TypingHandler } from './socket/handlers/typing.handler';
import { ConversationService } from './services/conversation.service';
import { ChatService } from './services/chat.service';

dotenv.config({ path: '../../../.env' });

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

const PORT = process.env.CHAT_SERVICE_PORT || 8002;

// Express middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'chat-service',
    timestamp: new Date().toISOString(),
  });
});

// REST API endpoints for conversations
const conversationService = new ConversationService();
const chatService = new ChatService();

app.get('/api/v1/conversations', async (req, res) => {
  try {
    const userId = (req as any).user?.userId || req.query.userId;
    const conversations = await conversationService.getUserConversations(userId as string);
    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

app.get('/api/v1/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { before, limit } = req.query;
    const messages = await chatService.getConversationMessages(
      id,
      limit ? parseInt(limit as string) : 50,
      before as string
    );
    res.json(messages);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

app.post('/api/v1/conversations/property', async (req, res) => {
  try {
    const conversation = await conversationService.createPropertyChat(req.body);
    res.json(conversation);
  } catch (error) {
    console.error('Error creating property chat:', error);
    res.status(500).json({ error: 'Failed to create property chat' });
  }
});

app.post('/api/v1/conversations/dm', async (req, res) => {
  try {
    const conversation = await conversationService.createDirectMessage(req.body);
    res.json(conversation);
  } catch (error) {
    console.error('Error creating DM:', error);
    res.status(500).json({ error: 'Failed to create DM' });
  }
});

// Redis adapter for horizontal scaling (OPTIONAL - demo works without it)
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('✅ Redis adapter configured for Socket.IO');
  })
  .catch(() => {
    console.log('⚠️  Redis not available - continuing in single instance mode (OK for demo)');
  });

// Socket.IO authentication middleware
io.use(authenticateSocket);

// Socket.IO connection handler
io.on('connection', (socket) => {
  const userId = socket.data.user.userId;
  console.log(`User connected: ${userId} (socket: ${socket.id})`);

  // Join user's personal room
  socket.join(`user:${userId}`);

  // Initialize handlers
  const messageHandler = new MessageHandler(io, socket);
  const typingHandler = new TypingHandler(io, socket);

  // Message events
  socket.on('message:send', messageHandler.sendMessage.bind(messageHandler));
  socket.on('message:read', messageHandler.markAsRead.bind(messageHandler));

  // Typing events
  socket.on('typing:start', typingHandler.startTyping.bind(typingHandler));
  socket.on('typing:stop', typingHandler.stopTyping.bind(typingHandler));

  // Conversation events
  socket.on('conversation:join', (data: { conversationId: string }) => {
    socket.join(`conversation:${data.conversationId}`);
    console.log(`User ${userId} joined conversation ${data.conversationId}`);
  });

  socket.on('conversation:leave', (data: { conversationId: string }) => {
    socket.leave(`conversation:${data.conversationId}`);
    console.log(`User ${userId} left conversation ${data.conversationId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId} (socket: ${socket.id})`);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Chat Service running on port ${PORT}`);
});

export { io };
export default app;
