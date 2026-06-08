# 🚀 Guía de Despliegue — Football AI Insights Pro

Esta guía explica cómo poner en marcha el proyecto **sin Docker**, tanto en tu
computador (desarrollo local) como en producción.

## Arquitectura de despliegue

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

| Pieza | Dónde se despliega | Por qué |
|---|---|---|
| **Frontend** (Next.js) | Vercel | Optimizado para Next.js |
| **Backend** (Express + Socket.io) | Render | Necesita WebSockets y proceso persistente |
| **AI Service** (Python/FastAPI) | Render | Proceso de larga duración con XGBoost |
| **Base de datos** (PostgreSQL) | Supabase | Gestionada, plan gratuito |
| **Redis** (caché) | Upstash *(opcional)* | La app funciona sin él |

---

## 1️⃣ Base de datos — Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **Project Settings → Database → Connection string**.
3. Copia dos cadenas de conexión:
   - **Transaction / Pooler** (puerto **6543**) → será `DATABASE_URL`
     - Agrégale al final: `?pgbouncer=true`
   - **Session / Direct** (puerto **5432**) → será `DIRECT_URL`
4. Reemplaza `[YOUR-PASSWORD]` por la contraseña real de tu base de datos.

Ejemplo:
```
DATABASE_URL=postgresql://postgres.abcd:miPass@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.abcd:miPass@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## 2️⃣ Backend + AI Service — Render

1. Sube el proyecto a un repositorio de GitHub.
2. En [render.com](https://render.com) → **New → Blueprint** y selecciona el repo.
   Render detectará el archivo [`render.yaml`](render.yaml) y creará **dos servicios**:
   `football-backend` y `football-ai`.
3. Completa las variables marcadas como *"set manually"* (las que no se autogeneran):
   - `DATABASE_URL` y `DIRECT_URL` (de Supabase, paso 1).
   - `API_FOOTBALL_KEY` (tu clave de [API-Football en RapidAPI](https://rapidapi.com/api-sports/api/api-football)).
   - `FRONTEND_URL` y `CORS_ORIGINS` → la URL de Vercel (la tendrás en el paso 3).
   - `AI_SERVICE_URL` → la URL pública del servicio `football-ai` (ej: `https://football-ai.onrender.com`).
   - `BACKEND_URL` (en el servicio AI) → la URL pública del backend.
   - (Opcionales) `REDIS_URL`, Google OAuth, Stripe, SMTP.
4. Render ejecuta automáticamente `prisma db push`, que crea las tablas en Supabase.

> 💡 En el plan gratuito de Render los servicios "se duermen" tras inactividad y
> tardan unos segundos en despertar. Es normal.

---

## 3️⃣ Frontend — Vercel

1. En [vercel.com](https://vercel.com) → **Add New → Project** y selecciona el repo.
2. En **Root Directory** elige la carpeta **`frontend`**.
3. Configura las variables de entorno (Settings → Environment Variables):
   - `NEXT_PUBLIC_API_URL` = `https://football-backend.onrender.com/api`  *(¡termina en `/api`!)*
   - `NEXT_PUBLIC_WS_URL` = `https://football-backend.onrender.com`  *(sin `/api`)*
   - `NEXT_PUBLIC_APP_NAME` = `Football AI Insights Pro`
4. **Deploy**. Cuando tengas la URL de Vercel, vuelve a Render y ponla en
   `FRONTEND_URL` / `CORS_ORIGINS` del backend.

---

## 🖥️ Desarrollo local (sin Docker)

Necesitas: **Node.js 20+**, **Python 3.12+** y una base de datos PostgreSQL
(puedes usar la misma de Supabase).

### Backend
```powershell
cd backend
copy .env.example .env   # edita .env con tus valores
npm install
npx prisma generate
npx prisma db push       # crea las tablas
npm run dev              # http://localhost:4000
```

### AI Service
```powershell
cd ai-service
copy .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000   # http://localhost:8000
```

### Frontend
```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```

---

## ✅ Comprobaciones rápidas

| Qué | Cómo |
|---|---|
| Backend vivo | Abre `https://TU-BACKEND.onrender.com/health` → `{"status":"ok"}` |
| AI Service vivo | Abre `https://TU-AI.onrender.com/health` → `{"status":"ok"}` |
| Frontend | Abre la URL de Vercel |
| Base de datos | En Supabase → Table Editor deben aparecer las tablas |

---

## 🔑 Resumen de variables por servicio

- **Backend** → ver [`backend/.env.example`](backend/.env.example)
- **Frontend** → ver [`frontend/.env.example`](frontend/.env.example)
- **AI Service** → ver [`ai-service/.env.example`](ai-service/.env.example)
