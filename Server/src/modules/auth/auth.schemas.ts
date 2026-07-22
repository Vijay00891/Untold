import { z } from 'zod';

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1).optional(), // may come from cookie instead
});
