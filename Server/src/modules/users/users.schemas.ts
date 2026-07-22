import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(30).optional(),
  hideAvatar: z.boolean().optional(),
});
