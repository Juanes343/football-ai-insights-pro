import axios, { AxiosError } from 'axios';
import { API_URL } from './config';
import { useAuthStore } from '@/store/auth';

export const api = axios.create({
  baseURL: API_URL,
  // Timeout amplio: el backend en Render (free) puede tardar en "despertar".
  timeout: 60_000,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta el token de acceso
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: { resolve: (t: string) => void; reject: (e: unknown) => void }[] = [];

function flush(error: unknown, token: string | null) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  queue = [];
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
}

// Refresca el token al recibir 401 (excepto en los propios endpoints de auth)
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;

    // No intentar refresh en login/registro/refresh: dejar pasar el error real.
    if (!original || error.response?.status !== 401 || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
        original.headers!.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const { refreshToken, setTokens } = useAuthStore.getState();
      if (!refreshToken) {
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const newToken: string = data.data.accessToken;
      setTokens(newToken, data.data.refreshToken);
      flush(null, newToken);
      original.headers!.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      flush(err, null);
      await useAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

/** Extrae un mensaje de error legible desde un error de axios. */
export function apiErrorMessage(err: unknown, fallback = 'Ocurrió un error'): string {
  const e = err as AxiosError<any>;
  if (e?.code === 'ECONNABORTED') return 'El servidor tardó en responder. Intenta de nuevo (puede estar despertando).';
  if (e?.message === 'Network Error') return 'Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.';
  const apiMsg = e?.response?.data?.error?.message || e?.response?.data?.message;
  if (apiMsg === 'Invalid credentials') return 'Correo o contraseña incorrectos.';
  return apiMsg || e?.message || fallback;
}
