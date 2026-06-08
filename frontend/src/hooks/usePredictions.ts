'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Prediction, ApiResponse } from '@/types';

export function useTodayPredictions() {
  return useQuery<Prediction[]>({
    queryKey: ['predictions', 'today'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Prediction[]>>('/predictions/today');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useTopPredictions() {
  return useQuery<Prediction[]>({
    queryKey: ['predictions', 'top'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Prediction[]>>('/predictions/top');
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

export function useMatchPrediction(matchId: string | number | null) {
  return useQuery<Prediction>({
    queryKey: ['prediction', matchId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Prediction>>(`/predictions/match/${matchId}`);
      return data.data;
    },
    enabled: !!matchId,
    staleTime: 10 * 60_000,
  });
}

export function usePredictionTrends() {
  return useQuery({
    queryKey: ['predictions', 'trends'],
    queryFn: async () => {
      const { data } = await api.get('/predictions/trends');
      return data.data;
    },
    staleTime: 30 * 60_000,
  });
}
