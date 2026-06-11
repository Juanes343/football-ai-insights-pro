import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, League, Standing } from '@/types';

export function useLeagues() {
  return useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<League[]>>('/leagues');
      return data.data;
    },
    staleTime: 60 * 60_000,
  });
}

export function useStandings(externalId: number | null) {
  return useQuery<Standing[]>({
    queryKey: ['standings', externalId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Standing[]>>(`/leagues/${externalId}/standings`);
      return data.data;
    },
    enabled: !!externalId,
    staleTime: 15 * 60_000,
  });
}
