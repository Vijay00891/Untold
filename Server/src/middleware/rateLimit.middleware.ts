import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';

export function rateLimit(scope: string, max: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
      next();
      return;
    }

    const key = `ratelimit:${scope}:${userId}`;

    try {
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > max) {
        const ttl = await redis.ttl(key);
        res.status(429).json({
          message: 'Too many requests',
          retryAfter: ttl,
        });
        return;
      }

      next();
    } catch {
      // If Redis is down, allow the request through
      next();
    }
  };
}
