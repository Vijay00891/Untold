import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.util.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 3000);
    return delay;
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

export async function testRedisConnection() {
  try {
    await redis.connect();
    await redis.ping();
    logger.info('Redis ping OK');
  } catch (err) {
    logger.error({ err }, 'Failed to connect to Redis');
    throw err;
  }
}
