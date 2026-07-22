import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { rateLimit } from '../../middleware/rateLimit.middleware.js';
import { sendMessageSchema } from './messages.schemas.js';
import {
  sendMessage,
  getConversationMessages,
  listConversations,
} from './messages.service.js';

const router = Router();

// GET /conversations
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversations = await listConversations(req.userId!);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// GET /conversations/:id/messages
router.get('/:id/messages', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cursor = (req.query.cursor as string) || null;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const result = await getConversationMessages(req.params.id as string, req.userId!, cursor, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /conversations/:id/messages
router.post(
  '/:id/messages',
  requireAuth,
  rateLimit('message', 60, 60), // 60 messages per minute
  validateBody(sendMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await sendMessage(req.params.id as string, req.userId!, req.body.encryptedBody);
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  }
);

export { router as messagesRoutes };
