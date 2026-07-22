import { query, getClient } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.middleware.js';

export interface Post {
  id: string;
  author_id: string | null;
  body: string;
  is_anonymous: boolean;
  like_count: number;
  created_at: Date;
}

export interface PostWithAuthor extends Post {
  author_name: string | null;
  author_avatar: string | null;
}

export async function createPost(authorId: string, body: string, isAnonymous: boolean): Promise<Post> {
  const result = await query(
    'INSERT INTO posts (author_id, body, is_anonymous) VALUES ($1, $2, $3) RETURNING *',
    [authorId, body, isAnonymous]
  );
  return result.rows[0] as Post;
}

export async function getFeed(cursor: string | null, limit: number = 20) {
  let posts;

  if (cursor) {
    posts = await query(
      `SELECT p.id, p.body, p.is_anonymous, p.like_count, p.created_at,
              CASE WHEN p.is_anonymous THEN NULL ELSE p.author_id END as author_id,
              CASE WHEN p.is_anonymous THEN NULL ELSE u.display_name END as author_name,
              CASE WHEN p.is_anonymous OR u.hide_avatar THEN NULL ELSE u.avatar_url END as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.created_at < $1
       ORDER BY p.created_at DESC
       LIMIT $2`,
      [cursor, limit]
    );
  } else {
    posts = await query(
      `SELECT p.id, p.body, p.is_anonymous, p.like_count, p.created_at,
              CASE WHEN p.is_anonymous THEN NULL ELSE p.author_id END as author_id,
              CASE WHEN p.is_anonymous THEN NULL ELSE u.display_name END as author_name,
              CASE WHEN p.is_anonymous OR u.hide_avatar THEN NULL ELSE u.avatar_url END as author_avatar
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1`,
      [limit]
    );
  }

  const nextCursor = posts.rows.length === limit
    ? posts.rows[posts.rows.length - 1].created_at.toISOString()
    : null;

  return { posts: posts.rows as PostWithAuthor[], nextCursor };
}

export async function getPostById(postId: string): Promise<PostWithAuthor> {
  const result = await query(
    `SELECT p.id, p.body, p.is_anonymous, p.like_count, p.created_at,
            CASE WHEN p.is_anonymous THEN NULL ELSE p.author_id END as author_id,
            CASE WHEN p.is_anonymous THEN NULL ELSE u.display_name END as author_name,
            CASE WHEN p.is_anonymous OR u.hide_avatar THEN NULL ELSE u.avatar_url END as author_avatar
     FROM posts p
     LEFT JOIN users u ON p.author_id = u.id
     WHERE p.id = $1`,
    [postId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Post not found', 404);
  }

  return result.rows[0] as PostWithAuthor;
}

export async function getUserPosts(userId: string, requestingUserId: string) {
  const isSelf = userId === requestingUserId;

  const result = await query(
    `SELECT p.id, p.body, p.is_anonymous, p.like_count, p.created_at,
            CASE WHEN p.is_anonymous AND $3 = false THEN NULL ELSE p.author_id END as author_id,
            CASE WHEN p.is_anonymous AND $3 = false THEN NULL ELSE u.display_name END as author_name,
            CASE WHEN (p.is_anonymous AND $3 = false) OR u.hide_avatar THEN NULL ELSE u.avatar_url END as author_avatar
     FROM posts p
     LEFT JOIN users u ON p.author_id = u.id
     WHERE p.author_id = $1
       AND (p.is_anonymous = false OR $2 = true)
     ORDER BY p.created_at DESC`,
    [userId, isSelf, isSelf]
  );

  return result.rows as PostWithAuthor[];
}

export async function likePost(userId: string, postId: string): Promise<{ likeCount: number }> {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const inserted = await client.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
      [userId, postId]
    );

    if (inserted.rowCount && inserted.rowCount > 0) {
      await client.query(
        'UPDATE posts SET like_count = like_count + 1 WHERE id = $1',
        [postId]
      );
    }

    const post = await client.query('SELECT like_count FROM posts WHERE id = $1', [postId]);
    await client.query('COMMIT');

    if (post.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    return { likeCount: post.rows[0].like_count };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function unlikePost(userId: string, postId: string): Promise<{ likeCount: number }> {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const deleted = await client.query(
      'DELETE FROM likes WHERE user_id = $1 AND post_id = $2 RETURNING *',
      [userId, postId]
    );

    if (deleted.rowCount && deleted.rowCount > 0) {
      await client.query(
        'UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
        [postId]
      );
    }

    const post = await client.query('SELECT like_count FROM posts WHERE id = $1', [postId]);
    await client.query('COMMIT');

    if (post.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    return { likeCount: post.rows[0].like_count };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function deletePost(userId: string, postId: string): Promise<void> {
  const result = await query(
    'DELETE FROM posts WHERE id = $1 AND author_id = $2',
    [postId, userId]
  );

  if (result.rowCount === 0) {
    throw new AppError('Post not found or unauthorized', 404);
  }
}

export async function isPostLikedByUser(userId: string, postId: string): Promise<boolean> {
  const result = await query(
    'SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2',
    [userId, postId]
  );
  return result.rows.length > 0;
}
