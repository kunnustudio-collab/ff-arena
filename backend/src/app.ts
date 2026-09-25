import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './common/middleware/error.middleware';
import { authRouter } from './modules/auth/auth.controller';
import { userRouter } from './modules/users/user.controller';
import { kycRouter } from './modules/kyc/kyc.controller';
import { walletRouter } from './modules/wallet/wallet.controller';
import { tournamentRouter } from './modules/tournaments/tournament.controller';
import { leaderboardRouter } from './modules/leaderboard/leaderboard.controller';
import { referralRouter } from './modules/referrals/referral.controller';
import { supportRouter } from './modules/support/support.controller';
import { notificationRouter } from './modules/notifications/notification.controller';
import { settingsRouter } from './modules/settings/settings.controller';
import { adminRouter } from './modules/admin/admin.controller';

export const createApp = (): Application => {
  const app = express();

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // For local dev & API usage
    crossOriginEmbedderPolicy: false,
  }));

  // CORS Configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'idempotency-key'],
  }));

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request ID & Logger
  app.use((req: Request, res: Response, next) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    next();
  });

  // Observability & Health Endpoints
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'tournament-x-api',
      version: '1.0.0',
    });
  });

  app.get('/ready', (req: Request, res: Response) => {
    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/live', (req: Request, res: Response) => {
    res.json({
      live: true,
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API v1 Routes
  const apiV1 = express.Router();
  apiV1.use('/auth', authRouter);
  apiV1.use('/users', userRouter);
  apiV1.use('/kyc', kycRouter);
  apiV1.use('/wallet', walletRouter);
  apiV1.use('/tournaments', tournamentRouter);
  apiV1.use('/leaderboard', leaderboardRouter);
  apiV1.use('/referrals', referralRouter);
  apiV1.use('/support', supportRouter);
  apiV1.use('/notifications', notificationRouter);
  apiV1.use('/settings', settingsRouter);
  apiV1.use('/admin', adminRouter);

  app.use('/api/v1', apiV1);

  // Fallback 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: {
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        code: 'NOT_FOUND',
      },
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
