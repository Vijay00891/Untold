import http from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { testConnection } from './config/db.js';
import { testRedisConnection } from './config/redis.js';
import { initSocketServer } from './sockets/chat.socket.js';
import { logger } from './utils/logger.util.js';

async function start() {
  // Test database connection
  await testConnection();

  // Test Redis connection
  await testRedisConnection();

  // Create HTTP server and attach Socket.IO
  const server = http.createServer(app);
  initSocketServer(server);

  server.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
