import { apiFootballService } from './apiFootball.service';
import { prisma } from '../db/prisma';
import { aiService } from './ai.service';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';

class MatchesService {
  async getLiveMatches() {
    const raw = await apiFootballService.getLiveMatches();
    return this.normalizeMatches(raw as any[]);
  }

  async getTodayMatches() {
    const today = new Date().toISOString().split('T')[0];
    return this.getMatchesByDate(today);
  }

  async getMatchesByDate(date: string) {
    const raw = await apiFootballService.getFixturesByDate(date);
    return this.normalizeMatches(raw as any[]);
  }

  async getMatchesByLeagueSeason(leagueId: number, season: number) {
    const raw = await apiFootballService.getFixturesByLeagueSeason(leagueId, season);
    return this.normalizeMatches(raw as any[]);
  }

  async getMatchById(fixtureId: number) {
    const raw = await apiFootballService.getFixtureById(fixtureId);
    const fixtures = raw as any[];
    if (!fixtures?.length) return null;
    return this.normalizeMatch(fixtures[0]);
  }

  async getMatchStatistics(fixtureId: number) {
    const raw = await apiFootballService.getFixtureStatistics(fixtureId);
    return this.normalizeStatistics(raw as any[]);
  }

  async getMatchEvents(fixtureId: number) {
    return apiFootballService.getFixtureEvents(fixtureId);
  }

  async getMatchLineups(fixtureId: number) {
    return apiFootballService.getFixtureLineups(fixtureId);
  }

  async getHeadToHead(fixtureId: number) {
    const match = await this.getMatchById(fixtureId);
    if (!match) return [];
    return apiFootballService.getHeadToHead(match.homeTeam.externalId, match.awayTeam.externalId);
  }

  private normalizeMatches(fixtures: any[]) {
    if (!Array.isArray(fixtures)) return [];
    return fixtures.map((f) => this.normalizeMatch(f));
  }

  /** Mapea el código de estado corto de API-Football al enum del frontend. */
  private mapStatus(short?: string): string {
    switch (short) {
      case 'TBD':
      case 'NS':
        return 'SCHEDULED';
      case '1H':
      case 'HT':
      case '2H':
      case 'ET':
      case 'BT':
      case 'P':
      case 'LIVE':
      case 'INT':
        return 'LIVE';
      case 'FT':
      case 'AET':
      case 'PEN':
        return 'FINISHED';
      case 'PST':
      case 'SUSP':
        return 'POSTPONED';
      case 'CANC':
      case 'ABD':
      case 'AWD':
      case 'WO':
        return 'CANCELLED';
      default:
        return 'SCHEDULED';
    }
  }

  private normalizeMatch(f: any) {
    const homeId = f.teams?.home?.id;
    const awayId = f.teams?.away?.id;
    const leagueId = f.league?.id;
    return {
      id: String(f.fixture?.id ?? ''),
      externalId: f.fixture?.id ?? null,
      status: this.mapStatus(f.fixture?.status?.short),
      minute: f.fixture?.status?.elapsed ?? null,
      startTime: f.fixture?.date ?? null,
      venue: f.fixture?.venue?.name ?? null,
      referee: f.fixture?.referee ?? null,
      league: {
        id: leagueId != null ? String(leagueId) : '',
        externalId: leagueId ?? null,
        name: f.league?.name ?? '',
        country: f.league?.country ?? '',
        logo: f.league?.logo ?? null,
        season: f.league?.season ?? null,
        isFeatured: false,
      },
      homeTeam: {
        id: homeId != null ? String(homeId) : '',
        externalId: homeId ?? null,
        name: f.teams?.home?.name ?? '',
        shortName: null,
        logo: f.teams?.home?.logo ?? null,
        country: null,
      },
      awayTeam: {
        id: awayId != null ? String(awayId) : '',
        externalId: awayId ?? null,
        name: f.teams?.away?.name ?? '',
        shortName: null,
        logo: f.teams?.away?.logo ?? null,
        country: null,
      },
      homeScore: f.goals?.home ?? null,
      awayScore: f.goals?.away ?? null,
      htHomeScore: f.score?.halftime?.home ?? null,
      htAwayScore: f.score?.halftime?.away ?? null,
      prediction: null,
    };
  }

  /** Devuelve las estadísticas en el formato { type, homeValue, awayValue } que espera el frontend. */
  private normalizeStatistics(stats: any[]) {
    if (!Array.isArray(stats) || stats.length < 1) return [];
    const home = stats[0]?.statistics ?? [];
    const away = stats[1]?.statistics ?? [];
    const awayByType = new Map<string, unknown>();
    away.forEach((s: any) => awayByType.set(s.type, s.value));
    return home.map((s: any) => ({
      type: s.type,
      homeValue: s.value != null ? String(s.value) : null,
      awayValue: awayByType.get(s.type) != null ? String(awayByType.get(s.type)) : null,
    }));
  }
}

export const matchesService = new MatchesService();
