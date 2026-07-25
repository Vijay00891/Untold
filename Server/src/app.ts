import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { postsRoutes } from './modules/posts/posts.routes.js';
import { messageRequestsRoutes } from './modules/messageRequests/messageRequests.routes.js';
import { messagesRoutes } from './modules/messages/messages.routes.js';
import { notificationsRoutes } from './modules/notifications/notifications.routes.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:19006', 'http://localhost:3000', 'https://untold-pied.vercel.app'],
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/message-requests', messageRequestsRoutes);
app.use('/api/conversations', messagesRoutes);
app.use('/api/notifications', notificationsRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export { app };
