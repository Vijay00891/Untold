import fs from 'fs';
import path from 'path';
import { pool, testConnection } from '../config/db.js';
import { logger } from '../utils/logger.util.js';

async function initDb() {
  await testConnection();

  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await pool.query(sql);
    logger.info('Database schema initialized successfully');
  } catch (err) {
    logger.error({ err }, 'Failed to initialize database schema');
    throw err;
  } finally {
    await pool.end();
  }
}

initDb().catch(() => process.exit(1));
