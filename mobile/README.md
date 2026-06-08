# 📱 Football AI Insights Pro — App móvil (Expo / React Native)

App móvil nativa (Android + iOS) que consume **la misma API** del proyecto web
(backend Express + AI service). No reemplaza nada del proyecto web.

## 🧩 Qué incluye
- Autenticación (login/registro) con token seguro (expo-secure-store).
- **Panel**, **Partidos** (buscador + filtro por estado + fechas), **Predicciones**,
  **Mundial 2026** (grupos + tabla proyectada) y **Perfil**.
- Detalle de partido con **predicción** (marcador más probable, consejo, comparativa y 2ª opinión).
- Reutiliza tipos, cliente API, react-query y la lógica del proyecto web.

---

## ▶️ Correr en desarrollo

1. Configura la URL del backend (¡debe ser accesible desde el celular!):
   ```powershell
   cd mobile
   copy .env.example .env
   ```
   Edita `.env`:
   - **Celular físico** (mismo WiFi que el PC) → usa la **IP LAN** del PC:
     `EXPO_PUBLIC_API_URL=http://192.168.1.X:4000/api`
     (mira tu IP con `ipconfig`).
   - **Producción** → la URL de Render:
     `EXPO_PUBLIC_API_URL=https://football-backend.onrender.com/api`

2. Arranca:
   ```powershell
   npm install
   npx expo start
   ```
3. Escanea el QR con la app **Expo Go** (Android/iOS) o usa un emulador.

> El backend y el AI service deben estar corriendo (ver el README de la raíz).

---

## 📦 Generar el APK (Android) e IPA (iOS) con EAS

EAS construye en la nube de Expo (https://expo.dev). Necesitas una cuenta Expo (gratis).

```powershell
cd mobile
npm install -g eas-cli      # una sola vez
eas login                   # inicia sesión con tu cuenta Expo
eas build:configure         # vincula el proyecto (crea projectId)

# APK de Android (instalable directo en el teléfono):
eas build -p android --profile preview

# iOS (requiere cuenta de Apple Developer para IPA instalable):
eas build -p ios --profile preview
```

Al terminar, EAS te da un **enlace para descargar el APK**.

> ⚠️ Importante: para que el APK funcione **fuera de tu WiFi**, el backend debe estar
> **desplegado** (Render) y `EXPO_PUBLIC_API_URL` debe apuntar a esa URL pública
> ANTES de hacer el build (las variables `EXPO_PUBLIC_*` se incrustan en el build).

---

## 🗂️ Estructura
```
mobile/
├─ src/
│  ├─ app/            # rutas (expo-router): index, login, register, (tabs), match/[id]
│  ├─ components/     # MatchCard, PredictionCard, ui
│  ├─ hooks/          # useAuth, useMatches, usePredictions
│  ├─ lib/            # api, theme, config, scores
│  ├─ store/          # auth (zustand + secure-store)
│  └─ types/          # tipos compartidos con la API
├─ app.json          # config Expo (nombre, íconos, package)
└─ eas.json          # perfiles de build (preview = APK)
```
