import { Router, Request, Response, NextFunction } from 'express';
import { validateBody } from '../../middleware/validate.middleware.js';
import { googleLoginSchema } from './auth.schemas.js';
import {
  verifyGoogleToken,
  findOrCreateUser,
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
  revokeSession,
} from './auth.service.js';

const router = Router();

// POST /auth/google
router.post(
  '/google',
  validateBody(googleLoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { idToken } = req.body;
      const profile = await verifyGoogleToken(idToken);
      const user = await findOrCreateUser(profile);

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Set refresh token as httpOnly cookie for web clients
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/api/auth',
      });

      res.json({
        accessToken,
        refreshToken, // Also in body for native clients using SecureStore
        user: {
          id: user.id,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }

    const accessToken = await refreshAccessToken(token);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (token) {
      await revokeSession(token);
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

export { router as authRoutes };
