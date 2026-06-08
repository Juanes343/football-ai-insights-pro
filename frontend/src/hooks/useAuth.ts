'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { AuthTokens, User } from '@/types';

export function useAuth() {
  const { user, isAuthenticated, setTokens, setUser, logout: storeLogout, accessToken } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  // Fetch current user when we have a token but no user object
  const { isLoading, data: meData } = useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: async (): Promise<User> => {
      const { data } = await api.get('/auth/me');
      return data.data as User;
    },
    enabled: !!accessToken && !user,
  });

  useEffect(() => {
    if (meData) setUser(meData);
  }, [meData, setUser]);

  const loginMutation = useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const { data } = await api.post<{ data: AuthTokens }>('/auth/login', creds);
      return data.data;
    },
    onSuccess: (tokens) => {
      setTokens(tokens.accessToken, tokens.refreshToken);
      setUser(tokens.user);
      router.push('/dashboard');
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
      router.push('/dashboard');
    },
  });

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      storeLogout();
      qc.clear();
      router.push('/auth/login');
    }
  }

  function loginWithGoogle() {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api'}/auth/google`;
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    loginMutation,
    registerMutation,
    logout,
    loginWithGoogle,
  };
}
