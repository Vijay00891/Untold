import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../middleware/validate.middleware.js';
import { rateLimit } from '../../middleware/rateLimit.middleware.js';
import { createPostSchema } from './posts.schemas.js';
import {
  createPost,
  getFeed,
  getPostById,
  getUserPosts,
  likePost,
  unlikePost,
  deletePost,
} from './posts.service.js';

const router = Router();

// POST /posts
router.post(
  '/',
  requireAuth,
  rateLimit('post', 10, 3600), // 10 posts per hour
  validateBody(createPostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const post = await createPost(req.userId!, req.body.body, req.body.isAnonymous);
      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

// GET /posts (feed)
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cursor = (req.query.cursor as string) || null;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const feed = await getFeed(cursor, limit);
    res.json(feed);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id
router.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await getPostById(req.params.id as string);
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /posts/:id/like
router.post('/:id/like', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await likePost(req.userId!, req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id/like
router.delete('/:id/like', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await unlikePost(req.userId!, req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deletePost(req.userId!, req.params.id as string);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

export { router as postsRoutes };
