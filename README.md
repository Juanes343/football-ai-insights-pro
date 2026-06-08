# Football AI Insights Pro

A professional SaaS football analytics platform with AI-powered predictions, real-time data, live scores, advanced statistics, user authentication, premium subscriptions, and WebSocket updates.

---

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────────┐
│       VERCEL        │        │            RENDER            │
│  Frontend (Next.js) │ ─────▶ │  Backend (Express+Socket.io) │
└─────────────────────┘        │  AI Service (FastAPI+XGBoost)│
                               └───────────────┬──────────────┘
                                               │
                                  ┌────────────▼────────────┐
                                  │   SUPABASE (PostgreSQL)  │
                                  │   Upstash (Redis, opc.)  │
                                  └──────────────────────────┘
```

> 📘 **Despliegue sin Docker:** consulta la guía paso a paso en
> [`DESPLIEGUE.md`](DESPLIEGUE.md) (Vercel + Render + Supabase).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 18, TypeScript, TailwindCSS, Zustand, TanStack Query v5 |
| Backend | Node.js, Express 4, TypeScript, Prisma ORM v5, Socket.io v4 |
| AI Service | Python 3.12, FastAPI, XGBoost, Scikit-Learn |
| Database | PostgreSQL (Supabase) |
| Cache | Redis (Upstash, opcional) |
| Hosting | Vercel (frontend) · Render (backend + IA) |
| Auth | JWT + Refresh tokens + Google OAuth2 |
| Payments | Stripe |

---

## Quick Start (desarrollo local, sin Docker)

### Requisitos
- Node.js 20+
- Python 3.12+ (para el servicio de IA)
- Una base de datos PostgreSQL (puedes usar Supabase)
- API-Football key de RapidAPI

### Pasos

Cada servicio tiene su propia plantilla de variables (`*/.env.example`).
La guía completa de instalación y despliegue está en
**[`DESPLIEGUE.md`](DESPLIEGUE.md)**. Resumen:

```powershell
# Backend
cd backend
copy .env.example .env   # edita tus valores
npm install && npx prisma generate && npx prisma db push
npm run dev              # http://localhost:4000

# AI Service
cd ../ai-service
copy .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # http://localhost:8000

# Frontend
cd ../frontend
copy .env.example .env.local
npm install && npm run dev   # http://localhost:3000
```

---

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) |
| `API_FOOTBALL_KEY` | API-Football v3 key from RapidAPI |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/auth/google` | Google OAuth redirect |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Matches
| Method | Path | Description |
|---|---|---|
| GET | `/api/matches/live` | Live matches |
| GET | `/api/matches?date=YYYY-MM-DD` | Matches by date |
| GET | `/api/matches/:id` | Match detail with stats |

### Predictions
| Method | Path | Description |
|---|---|---|
| GET | `/api/predictions/today` | Today's predictions |
| GET | `/api/predictions/top` | High-confidence picks |
| GET | `/api/predictions/match/:id` | Prediction for a match |
| GET | `/api/predictions/trends` | 7-day accuracy stats |

### Leagues
| Method | Path | Description |
|---|---|---|
| GET | `/api/leagues` | All leagues |
| GET | `/api/leagues/:id/standings` | League standings |

### Users (authenticated)
| Method | Path | Description |
|---|---|---|
| GET | `/api/users/profile` | My profile |
| PATCH | `/api/users/profile` | Update profile |
| GET | `/api/users/favorites` | Favorite teams/leagues |
| POST | `/api/users/favorites/team/:id` | Toggle favorite team |
| GET | `/api/users/subscription` | Subscription info |
| POST | `/api/users/subscription` | Create Stripe checkout |

### AI Service
| Method | Path | Description |
|---|---|---|
| POST | `/api/predict` | Get prediction for a match |
| GET | `/api/health` | AI model health |
| POST | `/api/train` | Trigger model retraining |

---

## WebSocket Events

Connect to `ws://localhost:4000` with Socket.io.

| Event | Direction | Payload |
|---|---|---|
| `subscribe:match` | Client → Server | `matchId: string` |
| `match:update` | Server → Client | `{ matchId, homeScore, awayScore, minute, status }` |
| `match:goal` | Server → Client | `{ matchId, teamId, player, minute, score }` |
| `match:status` | Server → Client | `{ matchId, status }` |

---

## Development

### Backend (hot reload)
```bash
cd backend
npm install
npm run dev
```

### Frontend (hot reload)
```bash
cd frontend
npm install
npm run dev
```

### AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Subscription Plans

| Feature | Free | Premium |
|---|---|---|
| Live scores | ✓ | ✓ |
| Basic predictions | ✓ | ✓ |
| High-confidence picks | — | ✓ |
| Advanced xG stats | — | ✓ |
| Match notifications | — | ✓ |
| AI detailed analysis | — | ✓ |

Configure Stripe products in the Stripe Dashboard and set `STRIPE_PRICE_ID_PREMIUM` in your `.env`.

---

## License

MIT
