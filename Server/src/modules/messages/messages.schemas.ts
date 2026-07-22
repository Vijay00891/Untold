import { z } from 'zod';

export const sendMessageSchema = z.object({
  encryptedBody: z.string().min(1).max(5000),
});
