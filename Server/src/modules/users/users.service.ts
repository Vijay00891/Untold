import { query, getClient } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.middleware.js';

export interface PublicUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export async function getUserById(userId: string): Promise<PublicUser> {
  const result = await query(
    `SELECT id, display_name, 
            CASE WHEN hide_avatar = true THEN NULL ELSE avatar_url END as avatar_url
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0] as PublicUser;
}

export async function getOwnProfile(userId: string) {
  const result = await query(
    'SELECT id, display_name, avatar_url, hide_avatar, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0];
}

export async function updateDisplayName(userId: string, newName: string) {
  const result = await query(
    'UPDATE users SET display_name = $1 WHERE id = $2 RETURNING id, display_name, avatar_url, hide_avatar',
    [newName, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0];
}

export async function updateAvatarVisibility(userId: string, hideAvatar: boolean) {
  const result = await query(
    'UPDATE users SET hide_avatar = $1 WHERE id = $2 RETURNING id, display_name, avatar_url, hide_avatar',
    [hideAvatar, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return result.rows[0];
}

export async function deleteAccount(userId: string): Promise<void> {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // Anonymize posts (don't delete — set author_id to null)
    await client.query('UPDATE posts SET author_id = NULL WHERE author_id = $1', [userId]);

    // Delete messages involving this user
    await client.query('DELETE FROM messages WHERE sender_id = $1', [userId]);

    // Delete message requests
    await client.query('DELETE FROM message_requests WHERE sender_id = $1 OR receiver_id = $1', [userId]);

    // Delete likes
    await client.query('DELETE FROM likes WHERE user_id = $1', [userId]);

    // Delete user
    await client.query('DELETE FROM users WHERE id = $1', [userId]);

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
