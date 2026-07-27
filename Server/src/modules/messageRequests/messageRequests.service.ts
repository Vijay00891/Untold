import { query, getClient } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.middleware.js';
import { createNotification } from '../notifications/notifications.service.js';

export interface MessageRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  first_message: string;
  created_at: Date;
}

/**
 * Sends the first message to establish a conversation.
 * Enforces: only one request per sender→receiver pair.
 * If a prior request exists (pending or declined), reject.
 */
export async function sendFirstMessage(
  senderId: string,
  receiverId: string,
  body: string
): Promise<MessageRequest> {
  if (senderId === receiverId) {
    throw new AppError('Cannot send a message request to yourself', 400);
  }

  // Check for existing request in either direction
  const existing = await query(
    `SELECT * FROM message_requests
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)`,
    [senderId, receiverId]
  );

  if (existing.rows.length > 0) {
    const req = existing.rows[0];
    if (req.status === 'pending') {
      throw new AppError('A message request is already pending between you two', 409);
    }
    if (req.status === 'declined') {
      throw new AppError('This connection was previously declined', 403);
    }
    if (req.status === 'accepted') {
      throw new AppError('You already have an active conversation with this person', 409);
    }
  }

  const result = await query(
    `INSERT INTO message_requests (sender_id, receiver_id, first_message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [senderId, receiverId, body]
  );

  const request = result.rows[0] as MessageRequest;

  // Trigger notification for the receiver
  try {
    const truncatedMessage = body.length > 30 ? body.substring(0, 30) + '...' : body;
    await createNotification(
      receiverId,
      'request',
      'New Message Request',
      `Someone sent you a message request: "${truncatedMessage}"`,
      { requestId: request.id }
    );
  } catch (err) {
    // Log but don't crash
  }

  return request;
}

/**
 * Gets the request status between two users from the perspective of userId.
 */
export async function getRequestStatus(
  userId: string,
  otherUserId: string
): Promise<'none' | 'pending_sent' | 'pending_received' | 'accepted' | 'declined'> {
  const result = await query(
    `SELECT * FROM message_requests
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $2 AND receiver_id = $1)`,
    [userId, otherUserId]
  );

  if (result.rows.length === 0) return 'none';

  const req = result.rows[0] as MessageRequest;

  if (req.status === 'accepted') return 'accepted';
  if (req.status === 'declined') return 'declined';

  // Pending — determine direction
  if (req.sender_id === userId) return 'pending_sent';
  return 'pending_received';
}

/**
 * Accept a message request. Only the receiver can accept.
 * Creates the first message in the messages table using the request's ID as conversation_id.
 */
export async function acceptRequest(
  requestId: string,
  receiverId: string
): Promise<{ conversationId: string }> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const req = await client.query(
      'SELECT * FROM message_requests WHERE id = $1 FOR UPDATE',
      [requestId]
    );

    if (req.rows.length === 0) {
      throw new AppError('Message request not found', 404);
    }

    const request = req.rows[0] as MessageRequest;

    if (request.receiver_id !== receiverId) {
      throw new AppError('Only the receiver can accept this request', 403);
    }

    if (request.status !== 'pending') {
      throw new AppError(`Request is already ${request.status}`, 400);
    }

    // Update status
    await client.query(
      'UPDATE message_requests SET status = $1 WHERE id = $2',
      ['accepted', requestId]
    );

    // Insert the first message into the messages table
    // Use the request ID as the conversation ID
    await client.query(
      'INSERT INTO messages (conversation_id, sender_id, body_encrypted) VALUES ($1, $2, $3)',
      [requestId, request.sender_id, request.first_message]
    );

    await client.query('COMMIT');

    // Trigger notification for the sender
    try {
      await createNotification(
        request.sender_id,
        'accept',
        'Request Accepted',
        'Anonymous accepted your message request. You can now chat.',
        { conversationId: requestId }
      );
    } catch (err) {
      // Log but don't crash
    }

    return { conversationId: requestId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Decline a message request. Only the receiver can decline.
 */
export async function declineRequest(requestId: string, receiverId: string): Promise<void> {
  const result = await query(
    `UPDATE message_requests SET status = 'declined'
     WHERE id = $1 AND receiver_id = $2 AND status = 'pending'
     RETURNING *`,
    [requestId, receiverId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Request not found, not yours to decline, or already processed', 404);
  }
}

/**
 * List all requests for a user, split into incoming and sent.
 */
export async function listRequestsForUser(userId: string) {
  const incoming = await query(
    `SELECT mr.*, 'Anonymous' as sender_name,
            NULL as sender_avatar
     FROM message_requests mr
     WHERE mr.receiver_id = $1
     ORDER BY mr.created_at DESC`,
    [userId]
  );

  const sent = await query(
    `SELECT mr.*, 'Anonymous' as receiver_name,
            NULL as receiver_avatar
     FROM message_requests mr
     WHERE mr.sender_id = $1
     ORDER BY mr.created_at DESC`,
    [userId]
  );

  return {
    incoming: incoming.rows,
    sent: sent.rows,
  };
}
