import { apiFootballService } from './apiFootball.service';
import { prisma } from '../db/prisma';
import { cacheService } from './cache.service';

class LeaguesService {
  // Top major leagues (API-Football IDs)
  private readonly TOP_LEAGUE_IDS = [39, 140, 135, 78, 61, 2, 3, 848, 71, 128];

  async getLeagues() {
    const cacheKey = 'leagues:all';
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const leagues = await prisma.league.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    if (leagues.length > 0) {
      await cacheService.set(cacheKey, leagues, 86400);
      return leagues;
    }

    // Fetch from API and seed DB
    const raw = await apiFootballService.getLeagues();
    const data = (raw as any[]).slice(0, 100).map((l: any) => ({
      externalId: l.league.id,
      name: l.league.name,
      country: l.country.name,
      logo: l.league.logo,
      flag: l.country.flag,
      season: l.seasons?.find((s: any) => s.current)?.year || new Date().getFullYear(),
      type: l.league.type,
    }));

    await prisma.league.createMany({ data, skipDuplicates: true });
    const result = await prisma.league.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    await cacheService.set(cacheKey, result, 86400);
    return result;
  }

  async getTopLeagues() {
    const all = await this.getLeagues();
    return (all as any[]).filter((l: any) => this.TOP_LEAGUE_IDS.includes(l.externalId));
  }

  async getLeagueById(externalId: number) {
    return prisma.league.findFirst({ where: { externalId } });
  }

  async getStandings(leagueExternalId: number) {
    const cacheKey = `standings:${leagueExternalId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const season = new Date().getFullYear();
    const raw = await apiFootballService.getStandings(leagueExternalId, season);
    const standings = (raw as any[])?.[0]?.league?.standings?.[0] || [];

    const result = standings.map((s: any) => ({
      rank: s.rank,
      team: { id: s.team.id, name: s.team.name, logo: s.team.logo },
      points: s.points,
      played: s.all.played,
      won: s.all.win,
      drawn: s.all.draw,
      lost: s.all.lose,
      goalsFor: s.all.goals.for,
      goalsAgainst: s.all.goals.against,
      goalDiff: s.goalsDiff,
      form: s.form,
    }));

    await cacheService.set(cacheKey, result, 900);
    return result;
  }

  async getLeagueMatches(leagueExternalId: number, season: number) {
    return prisma.match.findMany({
      where: { league: { externalId: leagueExternalId } },
      include: { homeTeam: true, awayTeam: true },
      orderBy: { kickoff: 'desc' },
      take: 50,
    });
  }

  async getTopScorers(leagueExternalId: number, season: number) {
    const cacheKey = `topscorers:${leagueExternalId}:${season}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const raw = await apiFootballService.getTopScorers(leagueExternalId, season);
    const result = (raw as any[]).slice(0, 20).map((p: any) => ({
      rank: p.statistics?.[0]?.goals?.total,
      player: { id: p.player.id, name: p.player.name, photo: p.player.photo, nationality: p.player.nationality, age: p.player.age },
      team: { id: p.statistics?.[0]?.team?.id, name: p.statistics?.[0]?.team?.name, logo: p.statistics?.[0]?.team?.logo },
      goals: p.statistics?.[0]?.goals?.total || 0,
      assists: p.statistics?.[0]?.goals?.assists || 0,
      appearances: p.statistics?.[0]?.games?.appearences || 0,
    }));

    await cacheService.set(cacheKey, result, 3600);
    return result;
  }
}

export const leaguesService = new LeaguesService();
