import { pool, testConnection } from '../config/db.js';
import { hashEmail } from '../utils/hash.util.js';
import { logger } from '../utils/logger.util.js';

async function seed() {
  await testConnection();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM messages');
    await client.query('DELETE FROM message_requests');
    await client.query('DELETE FROM likes');
    await client.query('DELETE FROM posts');
    await client.query('DELETE FROM users');

    // Create users
    const user1 = await client.query(
      `INSERT INTO users (id, google_sub, display_name, avatar_url, email_hash)
       VALUES (gen_random_uuid(), 'dev-sarah', 'Sarah J', NULL, $1)
       RETURNING *`,
      [hashEmail('sarah@dev.untold.app')]
    );

    const user2 = await client.query(
      `INSERT INTO users (id, google_sub, display_name, avatar_url, email_hash)
       VALUES (gen_random_uuid(), 'dev-alex', 'Alex Chen', NULL, $1)
       RETURNING *`,
      [hashEmail('alex@dev.untold.app')]
    );

    const user3 = await client.query(
      `INSERT INTO users (id, google_sub, display_name, avatar_url, email_hash)
       VALUES (gen_random_uuid(), 'dev-maya', 'Maya R', NULL, $1)
       RETURNING *`,
      [hashEmail('maya@dev.untold.app')]
    );

    const sarahId = user1.rows[0].id;
    const alexId = user2.rows[0].id;
    const mayaId = user3.rows[0].id;

    logger.info({ sarahId, alexId, mayaId }, 'Created users');

    // Create posts
    const post1 = await client.query(
      `INSERT INTO posts (author_id, body, is_anonymous, like_count)
       VALUES ($1, $2, false, 42)
       RETURNING *`,
      [sarahId, 'I recently left a job that looked perfect on paper but was destroying my mental health. Best decision I ever made.']
    );

    await client.query(
      `INSERT INTO posts (author_id, body, is_anonymous, like_count)
       VALUES ($1, $2, true, 128)`,
      [alexId, 'Sometimes I feel like everyone else has a manual for life that I never received. Navigating adulthood feels like guessing the answers on a test I didn\'t study for.']
    );

    await client.query(
      `INSERT INTO posts (author_id, body, is_anonymous, like_count)
       VALUES ($1, $2, true, 89)`,
      [mayaId, 'Just reached out to my estranged father after 5 years. I\'m terrified but hopeful.']
    );

    await client.query(
      `INSERT INTO posts (author_id, body, is_anonymous, like_count)
       VALUES ($1, $2, false, 15)`,
      [alexId, 'Started therapy last month. It\'s not what I expected — it\'s harder, but also more freeing than I imagined.']
    );

    await client.query(
      `INSERT INTO posts (author_id, body, is_anonymous, like_count)
       VALUES ($1, $2, true, 67)`,
      [sarahId, 'I\'ve been pretending to be happy at family gatherings for years. This year I\'m going to be honest about how I feel, even if it\'s uncomfortable.']
    );

    // Add some likes
    await client.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [alexId, post1.rows[0].id]
    );
    await client.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [mayaId, post1.rows[0].id]
    );

    // Create a PENDING message request (Alex → Sarah)
    const pendingReq = await client.query(
      `INSERT INTO message_requests (sender_id, receiver_id, first_message, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`,
      [alexId, sarahId, 'I completely relate to what you posted about leaving your job. I\'m in a similar situation right now and could use some perspective.']
    );

    logger.info({ requestId: pendingReq.rows[0].id }, 'Created pending message request (Alex → Sarah)');

    // Create an ACCEPTED message request with messages (Maya → Alex)
    const acceptedReq = await client.query(
      `INSERT INTO message_requests (sender_id, receiver_id, first_message, status)
       VALUES ($1, $2, $3, 'accepted')
       RETURNING *`,
      [mayaId, alexId, 'Your post about therapy really resonated with me. I\'ve been thinking about starting too.']
    );

    const convId = acceptedReq.rows[0].id;

    // Insert conversation messages
    await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body_encrypted, created_at)
       VALUES ($1, $2, $3, now() - interval '2 hours')`,
      [convId, mayaId, 'Your post about therapy really resonated with me. I\'ve been thinking about starting too.']
    );

    await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body_encrypted, created_at)
       VALUES ($1, $2, $3, now() - interval '1 hour')`,
      [convId, alexId, 'Thank you for reaching out! It honestly took me months to make the first appointment. Happy to share what helped me get there.']
    );

    await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body_encrypted, created_at)
       VALUES ($1, $2, $3, now() - interval '30 minutes')`,
      [convId, mayaId, 'That would mean a lot. What was the hardest part for you?']
    );

    logger.info({ conversationId: convId }, 'Created accepted conversation with messages (Maya ↔ Alex)');

    await client.query('COMMIT');
    logger.info('Seed data inserted successfully');

    // Print summary
    console.log('\n=== Seed Data Summary ===');
    console.log(`Users: Sarah (${sarahId}), Alex (${alexId}), Maya (${mayaId})`);
    console.log(`Posts: 5 total (3 anonymous, 2 named)`);
    console.log(`Pending request: Alex → Sarah`);
    console.log(`Accepted conversation: Maya ↔ Alex (3 messages)`);
    console.log('\nDev login tokens:');
    console.log('  Sarah: POST /api/auth/google { "idToken": "dev-Sarah J" }');
    console.log('  Alex:  POST /api/auth/google { "idToken": "dev-Alex Chen" }');
    console.log('  Maya:  POST /api/auth/google { "idToken": "dev-Maya R" }');
    console.log('========================\n');

  } catch (err) {
    await client.query('ROLLBACK');
    logger.error({ err }, 'Seed failed');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
