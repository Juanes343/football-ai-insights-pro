import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

interface MemEntry {
  value: unknown;
  expires: number;
}

/**
 * Servicio de caché con dos modos:
 *  - Redis: si se define REDIS_URL (recomendado en producción / multi-instancia).
 *  - Memoria: si no hay Redis, usa un caché en memoria con TTL.
 *
 * En ambos casos la caché está ACTIVA, lo que reduce las llamadas repetidas
 * a la API de fútbol (forma de equipos, fixtures, standings, etc.).
 */
class CacheService {
  public client: Redis | null = null;
  public readonly useRedis: boolean;
  private mem = new Map<string, MemEntry>();

  constructor() {
    this.useRedis = config.redis.enabled;

    if (this.useRedis) {
      this.client = new Redis(config.redis.url, {
        password: config.redis.password || undefined,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => Math.min(times * 50, 2000),
        lazyConnect: true,
      });
      this.client.on('error', (err) => logger.error('Redis error:', err));
      this.client.on('connect', () => logger.debug('Redis connected'));
    } else {
      logger.info('ℹ️  Caché en memoria activada (sin Redis)');
      // Limpieza periódica de entradas vencidas.
      const t = setInterval(() => this.cleanup(), 60_000);
      if (typeof t.unref === 'function') t.unref();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.client) {
      try {
        const value = await this.client.get(key);
        return value ? (JSON.parse(value) as T) : null;
      } catch {
        return null;
      }
    }
    const e = this.mem.get(key);
    if (!e) return null;
    if (Date.now() > e.expires) {
      this.mem.delete(key);
      return null;
    }
    return e.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (this.client) {
      try {
        await this.client.setex(key, ttlSeconds, JSON.stringify(value));
      } catch (err) {
        logger.warn('Cache set error:', err);
      }
      return;
    }
    this.mem.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  }

  async del(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        logger.warn('Cache del error:', err);
      }
      return;
    }
    this.mem.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) await this.client.del(...keys);
      } catch (err) {
        logger.warn('Cache delPattern error:', err);
      }
      return;
    }
    const regex = new RegExp('^' + pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
    for (const key of this.mem.keys()) {
      if (regex.test(key)) this.mem.delete(key);
    }
  }

  /** Comprueba la conexión. En modo memoria resuelve sin error. */
  async ping(): Promise<void> {
    if (this.client) await this.client.ping();
  }

  /** Cierra la conexión si existe. */
  disconnect(): void {
    this.client?.disconnect();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.mem.entries()) {
      if (now > entry.expires) this.mem.delete(key);
    }
  }
}

export const cacheService = new CacheService();
export const redisClient = cacheService.client;
