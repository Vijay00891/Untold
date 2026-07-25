import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt.util.js';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { logger } from '../utils/logger.util.js';

let io: Server;

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}

export function initSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:3000', 'https://untold-pied.vercel.app'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  // JWT authentication middleware for socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const payload = verifyToken(token, env.JWT_ACCESS_SECRET);
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;
    logger.info({ userId, socketId: socket.id }, 'Socket connected');

    // Join the user's personal room for direct notifications
    socket.join(`user:${userId}`);

    // Join a conversation room
    socket.on('join:conversation', async (conversationId: string) => {
      try {
        // Verify the user is a participant
        const result = await query(
          `SELECT 1 FROM message_requests
           WHERE id = $1 AND status = 'accepted'
             AND (sender_id = $2 OR receiver_id = $2)`,
          [conversationId, userId]
        );

        if (result.rows.length === 0) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        logger.debug({ userId, conversationId }, 'Joined conversation room');
      } catch (err) {
        logger.error({ err, userId, conversationId }, 'Error joining conversation');
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave a conversation room
    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('disconnect', () => {
      logger.info({ userId, socketId: socket.id }, 'Socket disconnected');
    });
  });

  logger.info('Socket.IO server initialized');
}

/**
 * Emit a new message to everyone in the conversation room.
 */
export function emitNewMessage(conversationId: string, message: any) {
  io.to(`conversation:${conversationId}`).emit('message:new', message);
}

/**
 * Emit a new message request notification to the receiver.
 */
export function emitNewMessageRequest(receiverId: string, request: any) {
  io.to(`user:${receiverId}`).emit('messageRequest:new', request);
}

/**
 * Notify the sender when their request is accepted.
 */
export function emitRequestAccepted(senderId: string, conversationId: string) {
  io.to(`user:${senderId}`).emit('messageRequest:accepted', { conversationId });
}
