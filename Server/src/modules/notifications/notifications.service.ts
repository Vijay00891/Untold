import { query } from '../../config/db.js';
import { getIO } from '../../sockets/chat.socket.js';
import { logger } from '../../utils/logger.util.js';
import { AppError } from '../../middleware/errorHandler.middleware.js';

export interface Notification {
  id: string;
  user_id: string;
  type: 'like' | 'request' | 'accept' | 'message';
  title: string;
  body: string;
  unread: boolean;
  data: any;
  created_at: string;
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const result = await query(
    `SELECT id, user_id, type, title, body, unread, data, created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows as Notification[];
}

export async function createNotification(
  userId: string,
  type: 'like' | 'request' | 'accept' | 'message',
  title: string,
  body: string,
  data?: any
): Promise<Notification> {
  const result = await query(
    `INSERT INTO notifications (user_id, type, title, body, data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, type, title, body, unread, data, created_at`,
    [userId, type, title, body, data ? JSON.stringify(data) : null]
  );

  const notification = result.rows[0] as Notification;

  // Emit real-time notification to the user's socket room
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification:new', notification);
  } catch (err) {
    // If Socket.IO is not initialized yet (e.g. during startup tests), log and continue
    logger.debug({ err, userId }, 'Could not emit socket notification (Socket.IO not initialized)');
  }

  return notification;
}

export async function markAsRead(userId: string, notificationId: string): Promise<Notification> {
  const result = await query(
    `UPDATE notifications
     SET unread = false
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, type, title, body, unread, data, created_at`,
    [notificationId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Notification not found', 404);
  }

  return result.rows[0] as Notification;
}

export async function markAllAsRead(userId: string): Promise<void> {
  await query(
    `UPDATE notifications
     SET unread = false
     WHERE user_id = $1`,
    [userId]
  );
}
