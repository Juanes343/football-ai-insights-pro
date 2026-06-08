import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Prediction, WorldCupGroup } from '@/types';

export function useMatchPrediction(externalId: number) {
  return useQuery<Prediction>({
    queryKey: ['prediction', externalId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Prediction>>(`/predictions/match/${externalId}`);
      return data.data;
    },
    enabled: !!externalId,
  });
}

export function useTopPredictions() {
  return useQuery<Prediction[]>({
    queryKey: ['predictions', 'top'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Prediction[]>>('/predictions/top');
      return data.data;
    },
  });
}

export function useTodayPredictions() {
  return useQuery<Prediction[]>({
    queryKey: ['predictions', 'today'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Prediction[]>>('/predictions/today');
      return data.data;
    },
  });
}

export function useWorldCup() {
  return useQuery<WorldCupGroup[]>({
    queryKey: ['worldcup'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ groups: WorldCupGroup[] }>>('/predictions/worldcup');
      return data.data.groups;
    },
    staleTime: 10 * 60_000,
  });
}
