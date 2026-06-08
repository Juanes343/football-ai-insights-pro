import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    name: process.env.APP_NAME || 'Football AI Insights Pro',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000'),
    url: process.env.APP_URL || 'http://localhost:4000',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    // Lista de orígenes permitidos por CORS (separados por coma).
    // Ej: "https://miapp.vercel.app,https://www.midominio.com"
    corsOrigins: (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
  db: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    // Redis es opcional: si no hay REDIS_URL la app funciona sin caché.
    enabled: !!process.env.REDIS_URL,
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_in_prod',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  apis: {
    football: {
      key: process.env.API_FOOTBALL_KEY || '',
      base: process.env.API_FOOTBALL_BASE || 'https://v3.football.api-sports.io',
    },
    footballData: {
      key: process.env.FOOTBALL_DATA_KEY || '',
      base: process.env.FOOTBALL_DATA_BASE || 'https://api.football-data.org/v4',
    },
    sportsDb: {
      key: process.env.THE_SPORTS_DB_KEY || '3',
      base: process.env.THE_SPORTS_DB_BASE || 'https://www.thesportsdb.com/api/v1/json',
    },
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  },
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'Football AI Insights Pro <noreply@example.com>',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
  },
  aiService: {
    url: process.env.AI_SERVICE_URL || 'http://localhost:8000',
    token: process.env.AI_SERVICE_TOKEN || 'internal_token',
  },
  cache: {
    ttl: {
      liveMatches: 30,       // 30 seconds
      fixtures: 300,         // 5 minutes
      standings: 900,        // 15 minutes
      teamStats: 1800,       // 30 minutes
      predictions: 3600,     // 1 hour
      leagues: 86400,        // 24 hours
    },
  },
};
