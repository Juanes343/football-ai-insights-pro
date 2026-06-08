import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types';

const ACCESS_KEY = 'fa_access_token';
const REFRESH_KEY = 'fa_refresh_token';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  hydrated: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,

  setTokens: (access, refresh) => {
    set({ accessToken: access, refreshToken: refresh });
    SecureStore.setItemAsync(ACCESS_KEY, access).catch(() => {});
    SecureStore.setItemAsync(REFRESH_KEY, refresh).catch(() => {});
  },

  setUser: (user) => set({ user }),

  hydrate: async () => {
    try {
      const [access, refresh] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_KEY),
        SecureStore.getItemAsync(REFRESH_KEY),
      ]);
      set({ accessToken: access, refreshToken: refresh, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },

  logout: async () => {
    set({ accessToken: null, refreshToken: null, user: null });
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY).catch(() => {}),
      SecureStore.deleteItemAsync(REFRESH_KEY).catch(() => {}),
    ]);
  },
}));
