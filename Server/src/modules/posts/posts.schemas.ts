import { z } from 'zod';

export const createPostSchema = z.object({
  body: z.string().min(1).max(2000),
  isAnonymous: z.boolean().default(true),
});
