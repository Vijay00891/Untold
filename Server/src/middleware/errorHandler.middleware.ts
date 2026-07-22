import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
