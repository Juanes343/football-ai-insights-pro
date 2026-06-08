import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { AuthTokens, User } from '@/types';

export function useAuth() {
  const { user, accessToken, setTokens, setUser, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const { isLoading } = useQuery<User>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      const u = data.data as User;
      setUser(u);
      return u;
    },
    enabled: !!accessToken && !user,
  });

  const loginMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const { data } = await api.post<{ data: AuthTokens }>('/auth/login', creds);
      return data.data;
    },
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(tokens.user);
      router.replace('/(tabs)');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; name: string }) => {
      const { data } = await api.post<{ data: AuthTokens }>('/auth/register', payload);
      return data.data;
    },
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(tokens.user);
      router.replace('/(tabs)');
    },
  });

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      /* noop */
    } finally {
      await storeLogout();
      qc.clear();
      router.replace('/login');
    }
  }

  return { user, isLoading, loginMutation, registerMutation, logout };
}

/** Hidrata el estado de sesión al iniciar la app. */
export function useHydrateAuth() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return hydrated;
}
