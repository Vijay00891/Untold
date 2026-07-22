import { z } from 'zod';

export const sendFirstMessageSchema = z.object({
  receiverId: z.string().uuid(),
  body: z.string().min(1).max(1000),
});
