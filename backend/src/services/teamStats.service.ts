import { apiFootballService } from './apiFootball.service';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';

/** Promedios por partido de un equipo (de sus últimos partidos finalizados). */
export interface TeamProfile {
  teamId: number;
  sampleSize: number;
  corners: number;       // córners a favor por partido
  fouls: number;         // faltas cometidas por partido
  yellow: number;        // amarillas por partido
  red: number;           // rojas por partido
  shots: number;         // remates totales por partido
  shotsOnGoal: number;   // remates al arco por partido
  goalsFor: number;
  goalsAgainst: number;
}

const TTL = 24 * 3600; // 24 h

const DEFAULT_PROFILE = (teamId: number): TeamProfile => ({
  teamId, sampleSize: 0, corners: 5, fouls: 12, yellow: 2, red: 0.1, shots: 12, shotsOnGoal: 4, goalsFor: 1.2, goalsAgainst: 1.2,
});

function num(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v).replace('%', ''));
  return isNaN(n) ? 0 : n;
}

class TeamStatsService {
  /** Perfil estadístico del equipo (cacheado 24h). */
  async getTeamProfile(teamId: number): Promise<TeamProfile> {
    if (!teamId) return DEFAULT_PROFILE(0);
    const key = `team-profile:${teamId}`;
    const cached = await cacheService.get<TeamProfile>(key);
    if (cached) return cached;

    try {
      const fixtures = (await apiFootballService.getTeamLastMatches(teamId, 6)) as any[];
      if (!Array.isArray(fixtures) || fixtures.length === 0) {
        return DEFAULT_PROFILE(teamId);
      }

      const acc = { corners: 0, fouls: 0, yellow: 0, red: 0, shots: 0, shotsOnGoal: 0, gf: 0, ga: 0 };
      let n = 0;

      for (const f of fixtures) {
        const fid = f.fixture?.id;
        if (!fid) continue;
        const home = f.teams?.home?.id === teamId;
        acc.gf += (home ? f.goals?.home : f.goals?.away) ?? 0;
        acc.ga += (home ? f.goals?.away : f.goals?.home) ?? 0;

        const statsRaw = (await apiFootballService.getFixtureStatistics(fid)) as any[];
        const teamStats = Array.isArray(statsRaw) ? statsRaw.find((s) => s.team?.id === teamId) : null;
        if (!teamStats?.statistics) continue;
        const get = (type: string) => {
          const item = teamStats.statistics.find((x: any) => x.type === type);
          return num(item?.value);
        };
        acc.corners += get('Corner Kicks');
        acc.fouls += get('Fouls');
        acc.yellow += get('Yellow Cards');
        acc.red += get('Red Cards');
        acc.shots += get('Total Shots');
        acc.shotsOnGoal += get('Shots on Goal');
        n++;
      }

      if (n === 0) return DEFAULT_PROFILE(teamId);

      const profile: TeamProfile = {
        teamId,
        sampleSize: n,
        corners: acc.corners / n,
        fouls: acc.fouls / n,
        yellow: acc.yellow / n,
        red: acc.red / n,
        shots: acc.shots / n,
        shotsOnGoal: acc.shotsOnGoal / n,
        goalsFor: acc.gf / n,
        goalsAgainst: acc.ga / n,
      };
      await cacheService.set(key, profile, TTL);
      return profile;
    } catch (err) {
      logger.warn(`No se pudo calcular el perfil del equipo ${teamId}:`, err);
      return DEFAULT_PROFILE(teamId);
    }
  }
}

export const teamStatsService = new TeamStatsService();
