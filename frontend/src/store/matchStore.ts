import { create } from 'zustand';
import type { Match, WsMatchUpdate, WsGoalEvent } from '@/types';

interface MatchState {
  liveMatches: Match[];
  matchCache: Record<string, Match>;
  setLiveMatches: (matches: Match[]) => void;
  updateMatch: (update: WsMatchUpdate) => void;
  handleGoal: (event: WsGoalEvent) => void;
  setMatch: (match: Match) => void;
  getMatch: (id: string) => Match | undefined;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  liveMatches: [],
  matchCache: {},

  setLiveMatches(matches) {
    const cache: Record<string, Match> = {};
    matches.forEach((m) => (cache[m.id] = m));
    set({ liveMatches: matches, matchCache: { ...get().matchCache, ...cache } });
  },

  updateMatch(update) {
    set((state) => {
      const live = state.liveMatches.map((m) =>
        m.id === update.matchId
          ? { ...m, homeScore: update.homeScore, awayScore: update.awayScore, minute: update.minute, status: update.status }
          : m
      );
      const cached = state.matchCache[update.matchId];
      return {
        liveMatches: live,
        matchCache: cached
          ? { ...state.matchCache, [update.matchId]: { ...cached, homeScore: update.homeScore, awayScore: update.awayScore, minute: update.minute, status: update.status } }
          : state.matchCache,
      };
    });
  },

  handleGoal(event) {
    // optimistic score update handled by updateMatch; this is available for toast notifications
    set((state) => {
      const m = state.matchCache[event.matchId];
      if (!m) return state;
      return {
        matchCache: {
          ...state.matchCache,
          [event.matchId]: { ...m, homeScore: event.score.home, awayScore: event.score.away },
        },
      };
    });
  },

  setMatch(match) {
    set((state) => ({ matchCache: { ...state.matchCache, [match.id]: match } }));
  },

  getMatch(id) {
    return get().matchCache[id];
  },
}));
