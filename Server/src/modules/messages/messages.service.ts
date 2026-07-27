import { query } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.middleware.js';
import { createNotification } from '../notifications/notifications.service.js';
import { emitNewMessage } from '../../sockets/chat.socket.js';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body_encrypted: string;
  created_at: Date;
}

export interface ConversationSummary {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  other_user_avatar: string | null;
  last_message: string;
  last_message_at: Date;
}

/**
 * Verifies that the conversation (message request) is accepted
 * and the user is a participant.
 */
async function verifyConversationAccess(conversationId: string, userId: string) {
  const result = await query(
    `SELECT * FROM message_requests
     WHERE id = $1 AND status = 'accepted'
       AND (sender_id = $2 OR receiver_id = $2)`,
    [conversationId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Conversation not found or not accepted', 404);
  }

  return result.rows[0];
}

/**
 * Sends a message in an accepted conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  encryptedBody: string
): Promise<Message> {
  const reqObj = await verifyConversationAccess(conversationId, senderId);

  const result = await query(
    `INSERT INTO messages (conversation_id, sender_id, body_encrypted)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversationId, senderId, encryptedBody]
  );

  const message = result.rows[0] as Message;

  // Emit to socket room for real-time delivery
  try {
    emitNewMessage(conversationId, message);
  } catch (err) {
    // Log but don't fail the request
  }

  // Trigger notification for the receiver
  try {
    const receiverId = reqObj.sender_id === senderId ? reqObj.receiver_id : reqObj.sender_id;
    // Note: Since the body is encrypted, we send a generic notification preview.
    await createNotification(
      receiverId,
      'message',
      'New Message',
      'You received a new message.',
      { conversationId }
    );
  } catch (err) {
    // Log but don't fail the request
  }

  return message;
}

/**
 * Gets paginated messages for a conversation.
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  cursor: string | null,
  limit: number = 50
) {
  await verifyConversationAccess(conversationId, userId);

  let messages;
  if (cursor) {
    messages = await query(
      `SELECT * FROM messages
       WHERE conversation_id = $1 AND created_at < $2
       ORDER BY created_at DESC
       LIMIT $3`,
      [conversationId, cursor, limit]
    );
  } else {
    messages = await query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [conversationId, limit]
    );
  }

  const nextCursor = messages.rows.length === limit
    ? messages.rows[messages.rows.length - 1].created_at.toISOString()
    : null;

  return { messages: messages.rows as Message[], nextCursor };
}

/**
 * Lists all accepted conversations for a user with last message preview.
 */
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const result = await query(
    `SELECT
       mr.id as conversation_id,
       CASE WHEN mr.sender_id = $1 THEN mr.receiver_id ELSE mr.sender_id END as other_user_id,
       u.display_name as other_user_name,
       CASE WHEN u.hide_avatar THEN NULL ELSE u.avatar_url END as other_user_avatar,
       latest_msg.body_encrypted as last_message,
       latest_msg.created_at as last_message_at
     FROM message_requests mr
     JOIN users u ON u.id = CASE WHEN mr.sender_id = $1 THEN mr.receiver_id ELSE mr.sender_id END
     LEFT JOIN LATERAL (
       SELECT body_encrypted, created_at
       FROM messages m
       WHERE m.conversation_id = mr.id
       ORDER BY m.created_at DESC
       LIMIT 1
     ) latest_msg ON true
     WHERE mr.status = 'accepted'
       AND (mr.sender_id = $1 OR mr.receiver_id = $1)
     ORDER BY COALESCE(latest_msg.created_at, mr.created_at) DESC`,
    [userId]
  );

  return result.rows as ConversationSummary[];
}
