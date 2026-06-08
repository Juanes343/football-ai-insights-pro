import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';

class APIFootballService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apis.football.base,
      headers: {
        'x-rapidapi-key': config.apis.football.key,
        'x-rapidapi-host': 'v3.football.api-sports.io',
      },
      timeout: 15000,
    });

    this.client.interceptors.response.use(
      (r) => r,
      (err) => {
        logger.error('API-Football error:', { status: err.response?.status, message: err.message });
        throw err;
      }
    );
  }

  private async get<T>(endpoint: string, params: Record<string, unknown> = {}, ttl?: number): Promise<T> {
    const cacheKey = `api-football:${endpoint}:${JSON.stringify(params)}`;
    const cached = await cacheService.get<T>(cacheKey);
    if (cached) return cached;

    const { data } = await this.client.get(endpoint, { params });
    const result = data.response as T;

    if (ttl) await cacheService.set(cacheKey, result, ttl);
    return result;
  }

  async getLiveMatches() {
    return this.get<unknown[]>('/fixtures', { live: 'all' }, config.cache.ttl.liveMatches);
  }

  async getFixturesByDate(date: string) {
    return this.get<unknown[]>('/fixtures', { date }, config.cache.ttl.fixtures);
  }

  async getFixturesByLeagueSeason(leagueId: number, season: number) {
    return this.get<unknown[]>('/fixtures', { league: leagueId, season }, config.cache.ttl.fixtures);
  }

  async getFixtureById(fixtureId: number) {
    return this.get<unknown[]>('/fixtures', { id: fixtureId }, config.cache.ttl.fixtures);
  }

  async getFixtureStatistics(fixtureId: number) {
    return this.get<unknown[]>('/fixtures/statistics', { fixture: fixtureId }, config.cache.ttl.fixtures);
  }

  async getFixtureEvents(fixtureId: number) {
    return this.get<unknown[]>('/fixtures/events', { fixture: fixtureId }, config.cache.ttl.liveMatches);
  }

  async getFixtureLineups(fixtureId: number) {
    return this.get<unknown[]>('/fixtures/lineups', { fixture: fixtureId }, config.cache.ttl.fixtures);
  }

  async getHeadToHead(team1: number, team2: number) {
    return this.get<unknown[]>('/fixtures/headtohead', { h2h: `${team1}-${team2}`, last: 20 }, config.cache.ttl.teamStats);
  }

  /** Predicción propia de API-Football para un partido (incluye comparativas). */
  async getApiPredictions(fixtureId: number) {
    const res = await this.get<unknown[]>('/predictions', { fixture: fixtureId }, config.cache.ttl.predictions);
    return Array.isArray(res) && res.length > 0 ? res[0] : null;
  }

  async getLeagues(params: Record<string, unknown> = {}) {
    return this.get<unknown[]>('/leagues', { current: true, ...params }, config.cache.ttl.leagues);
  }

  async getStandings(leagueId: number, season: number) {
    return this.get<unknown[]>('/standings', { league: leagueId, season }, config.cache.ttl.standings);
  }

  async getTeamById(teamId: number) {
    return this.get<unknown[]>('/teams', { id: teamId }, config.cache.ttl.teamStats);
  }

  async getTeamStatistics(teamId: number, leagueId: number, season: number) {
    return this.get<unknown>('/teams/statistics', { team: teamId, league: leagueId, season }, config.cache.ttl.teamStats);
  }

  async getTeamLastMatches(teamId: number, count = 10) {
    return this.get<unknown[]>('/fixtures', { team: teamId, last: count, status: 'FT' }, config.cache.ttl.teamStats);
  }

  async getTopScorers(leagueId: number, season: number) {
    return this.get<unknown[]>('/players/topscorers', { league: leagueId, season }, config.cache.ttl.teamStats);
  }

  async getPlayerInjuries(teamId: number) {
    return this.get<unknown[]>('/injuries', { team: teamId }, config.cache.ttl.teamStats);
  }

  async getSquad(teamId: number) {
    return this.get<unknown[]>('/players/squads', { team: teamId }, config.cache.ttl.teamStats);
  }
}

export const apiFootballService = new APIFootballService();
