import { z } from 'zod';

export const sendFirstMessageSchema = z.object({
  receiverId: z.string().uuid().optional(),
  postId: z.string().uuid().optional(),
  body: z.string().min(1).max(1000),
}).refine(data => data.receiverId || data.postId, {
  message: "Either receiverId or postId must be provided",
  path: ["receiverId"]
});
