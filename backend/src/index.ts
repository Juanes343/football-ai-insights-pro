import { createServer } from 'http';
import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './db/prisma';
import { cacheService } from './services/cache.service';
import { initWebSocket } from './services/websocket.service';
import { startSchedulers } from './services/scheduler.service';

async function bootstrap() {
  // ── Test DB connection ────────────────────────────────────
  await prisma.$connect();
  logger.info('✅ PostgreSQL connected');

  // ── Caché (Redis opcional, si no, memoria) ────────────────
  if (cacheService.useRedis) {
    await cacheService.ping();
    logger.info('✅ Redis conectado');
  } else {
    logger.info('ℹ️  Usando caché en memoria (sin Redis)');
  }

  // ── Create HTTP server ────────────────────────────────────
  const app = createApp();
  const httpServer = createServer(app);

  // ── WebSocket ─────────────────────────────────────────────
  initWebSocket(httpServer);
  logger.info('✅ WebSocket server initialized');

  // ── Background schedulers ─────────────────────────────────
  startSchedulers();
  logger.info('✅ Schedulers started');

  // ── Listen ────────────────────────────────────────────────
  httpServer.listen(config.app.port, () => {
    logger.info(`🚀 ${config.app.name} API running on port ${config.app.port}`);
    logger.info(`   Environment : ${config.app.env}`);
    logger.info(`   Frontend    : ${config.app.frontendUrl}`);
    logger.info(`   AI Service  : ${config.aiService.url}`);
  });

  // ── Graceful shutdown ─────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    httpServer.close(async () => {
      await prisma.$disconnect();
      cacheService.disconnect();
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal bootstrap error:', err);
  process.exit(1);
});
