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

export interface ResultItem {
  externalId: number;
  home: string;
  away: string;
  homeLogo: string | null;
  awayLogo: string | null;
  league: string;
  homeScore: number;
  awayScore: number;
  predicted: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
  actual: 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
  correct: boolean;
  confidence: number;
}
export interface DayResults {
  date: string;
  total: number;
  correct: number;
  accuracy: number;
  items: ResultItem[];
}

export function useResults(date: string) {
  return useQuery<DayResults>({
    queryKey: ['results', date],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DayResults>>(`/predictions/results/${date}`);
      return data.data;
    },
    staleTime: 15 * 60_000,
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
