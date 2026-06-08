import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import passport from 'passport';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { configurePassport } from './config/passport';

// Routes
import authRoutes from './routes/auth.routes';
import matchRoutes from './routes/matches.routes';
import predictionRoutes from './routes/predictions.routes';
import leagueRoutes from './routes/leagues.routes';
import teamRoutes from './routes/teams.routes';
import userRoutes from './routes/users.routes';
import notificationRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import webhookRoutes from './routes/webhooks.routes';

export function createApp(): Application {
  const app = express();

  // ── Security ──────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", ...config.app.corsOrigins],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Orígenes permitidos: lista de CORS_ORIGINS + cualquier preview *.vercel.app
  const allowedOrigins = new Set(config.app.corsOrigins);
  app.use(cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin origen (apps móviles, curl, healthchecks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.has(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }
      return callback(new Error(`Origen no permitido por CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Raw body for Stripe webhooks ──────────────────────────
  app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

  // ── Body parsing ──────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(compression());

  // ── Logging ───────────────────────────────────────────────
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  }));

  // ── Passport ──────────────────────────────────────────────
  configurePassport(passport);
  app.use(passport.initialize());

  // ── Rate Limiting ─────────────────────────────────────────
  app.use('/api/', apiLimiter);

  // ── Health check ──────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      app: config.app.name,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // ── API Routes ────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/matches', matchRoutes);
  app.use('/api/predictions', predictionRoutes);
  app.use('/api/leagues', leagueRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/webhooks', webhookRoutes);

  // ── 404 ───────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // ── Global error handler ──────────────────────────────────
  app.use(errorHandler);

  return app;
}
