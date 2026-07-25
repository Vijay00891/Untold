import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from './notifications.service.js';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await getNotifications(req.userId!);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notification = await markAsRead(req.userId!, req.params.id as string);
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await markAllAsRead(req.userId!);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
});

export { router as notificationsRoutes };
