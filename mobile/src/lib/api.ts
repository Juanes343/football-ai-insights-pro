import axios, { AxiosError } from 'axios';
import { API_URL } from './config';
import { useAuthStore } from '@/store/auth';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20_000,
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

// Refresca el token al recibir 401
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retry) {
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
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) throw new Error('Sin refresh token');
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
