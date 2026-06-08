import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Match } from '@/types';

export function useLiveMatches() {
  return useQuery<Match[]>({
    queryKey: ['matches', 'live'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Match[]>>('/matches/live');
      return data.data;
    },
    refetchInterval: 60_000,
  });
}

export function useMatchesByDate(date: string) {
  return useQuery<Match[]>({
    queryKey: ['matches', 'date', date],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Match[]>>(`/matches/date/${date}`);
      return data.data;
    },
  });
}

export function useMatch(externalId: number) {
  return useQuery<Match>({
    queryKey: ['match', externalId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Match>>(`/matches/${externalId}`);
      return data.data;
    },
    enabled: !!externalId,
  });
}
