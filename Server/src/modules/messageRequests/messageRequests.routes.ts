import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { rateLimit } from '../../middleware/rateLimit.middleware.js';
import { sendFirstMessageSchema } from './messageRequests.schemas.js';
import { query } from '../../config/db.js';
import { AppError } from '../../middleware/errorHandler.middleware.js';
import {
  sendFirstMessage,
  getRequestStatus,
  acceptRequest,
  declineRequest,
  listRequestsForUser,
} from './messageRequests.service.js';

const router = Router();

// POST /message-requests
router.post(
  '/',
  requireAuth,
  rateLimit('request', 5, 3600), // 5 requests per hour
  validateBody(sendFirstMessageSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let receiverId = req.body.receiverId;
      
      // Securely resolve receiverId from postId if it's missing (e.g. anonymous posts)
      if (req.body.postId) {
        const postResult = await query('SELECT author_id FROM posts WHERE id = $1', [req.body.postId]);
        if (postResult.rows.length === 0) {
          throw new AppError('Post not found', 404);
        }
        receiverId = postResult.rows[0].author_id;
        if (!receiverId) {
          throw new AppError('The author of this post no longer exists', 404);
        }
      }

      const request = await sendFirstMessage(req.userId!, receiverId, req.body.body);
      res.status(201).json(request);
    } catch (err) {
      next(err);
    }
  }
);

// GET /message-requests
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requests = await listRequestsForUser(req.userId!);
    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// GET /message-requests/status/:otherUserId
router.get('/status/:otherUserId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = await getRequestStatus(req.userId!, req.params.otherUserId as string);
    res.json({ status });
  } catch (err) {
    next(err);
  }
});

// POST /message-requests/:id/accept
router.post('/:id/accept', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await acceptRequest(req.params.id as string, req.userId!);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /message-requests/:id/decline
router.post('/:id/decline', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await declineRequest(req.params.id as string, req.userId!);
    res.json({ message: 'Request declined' });
  } catch (err) {
    next(err);
  }
});

export { router as messageRequestsRoutes };
