'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useMatchStore } from '@/store/matchStore';
import type { Match, ApiResponse } from '@/types';
import { format } from 'date-fns';

export function useLiveMatches() {
  const { setLiveMatches } = useMatchStore();
  return useQuery<Match[]>({
    queryKey: ['matches', 'live'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Match[]>>('/matches/live');
      setLiveMatches(data.data);
      return data.data;
    },
    refetchInterval: 30_000,
  });
}

export function useMatchesByDate(date: Date) {
  const dateStr = format(date, 'yyyy-MM-dd');
  return useQuery<Match[]>({
    queryKey: ['matches', 'date', dateStr],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Match[]>>(`/matches?date=${dateStr}`);
      return data.data;
    },
    staleTime: 60_000,
  });
}

export function useMatch(id: number) {
  return useQuery<Match>({
    queryKey: ['match', id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Match>>(`/matches/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 15_000,
  });
}
