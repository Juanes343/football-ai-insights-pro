/**
 * Configuración de la app móvil.
 *
 * La API (backend Express) es la MISMA del proyecto web.
 * - En desarrollo con el celular físico: usa la IP LAN de tu PC (no localhost).
 *   Ej: EXPO_PUBLIC_API_URL=http://192.168.1.10:4000/api
 * - En producción: la URL del backend en Render.
 *   Ej: EXPO_PUBLIC_API_URL=https://football-backend.onrender.com/api
 *
 * Define EXPO_PUBLIC_API_URL en un archivo .env de la carpeta mobile/.
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export const APP_NAME = 'Football AI Insights Pro';
