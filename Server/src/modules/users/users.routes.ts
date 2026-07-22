import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { updateProfileSchema } from './users.schemas.js';
import {
  getUserById,
  getOwnProfile,
  updateDisplayName,
  updateAvatarVisibility,
  deleteAccount,
} from './users.service.js';
import { getUserPosts } from '../posts/posts.service.js';

const router = Router();

// GET /users/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getOwnProfile(req.userId!);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /users/me/posts
router.get('/me/posts', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const posts = await getUserPosts(req.userId!, req.userId!);
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// PATCH /users/me
router.patch(
  '/me',
  requireAuth,
  validateBody(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let user;
      if (req.body.displayName !== undefined) {
        user = await updateDisplayName(req.userId!, req.body.displayName);
      }
      if (req.body.hideAvatar !== undefined) {
        user = await updateAvatarVisibility(req.userId!, req.body.hideAvatar);
      }
      res.json(user || (await getOwnProfile(req.userId!)));
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /users/me
router.delete('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteAccount(req.userId!);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
});

// GET /users/:id (public profile)
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.params.id as string);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export { router as usersRoutes };
