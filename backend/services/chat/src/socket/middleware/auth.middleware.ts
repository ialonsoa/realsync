import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

export const authenticateSocket = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Attach user data to socket
    socket.data.user = {
      userId: decoded.userId || decoded.id || decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};
