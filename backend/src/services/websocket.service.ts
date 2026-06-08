import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

export function initWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const ok =
          config.app.corsOrigins.includes(origin) ||
          /\.vercel\.app$/.test(new URL(origin).hostname);
        return callback(ok ? null : new Error('Origen no permitido'), ok);
      },
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware ───────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const payload = jwt.verify(token, config.jwt.secret) as { userId: string };
        (socket as any).userId = payload.userId;
      } catch {
        // Anonymous connections allowed for public data
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    logger.debug(`WS connected: ${socket.id}`);

    // Join rooms
    socket.on('join:match', (matchId: number) => {
      socket.join(`match:${matchId}`);
      logger.debug(`Socket ${socket.id} joined match:${matchId}`);
    });

    socket.on('leave:match', (matchId: number) => {
      socket.leave(`match:${matchId}`);
    });

    socket.on('join:league', (leagueId: number) => {
      socket.join(`league:${leagueId}`);
    });

    // User-specific room
    const userId = (socket as any).userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('disconnect', () => {
      logger.debug(`WS disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function emitMatchUpdate(matchId: number, data: unknown) {
  io?.to(`match:${matchId}`).emit('match:update', data);
}

export function emitGoal(matchId: number, data: unknown) {
  io?.to(`match:${matchId}`).emit('match:goal', data);
  io?.emit('live:goal', data); // Broadcast to all
}

export function emitMatchStatus(matchId: number, status: string, data: unknown) {
  io?.to(`match:${matchId}`).emit('match:status', { status, ...data as object });
}

export function emitUserNotification(userId: string, notification: unknown) {
  io?.to(`user:${userId}`).emit('notification', notification);
}

export function emitStandingsUpdate(leagueId: number, data: unknown) {
  io?.to(`league:${leagueId}`).emit('standings:update', data);
}

export function getIO(): SocketIOServer {
  return io;
}
