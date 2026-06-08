import { apiFootballService } from './apiFootball.service';
import { prisma } from '../db/prisma';

class TeamsService {
  async searchTeams(query: string) {
    if (!query || query.length < 2) return [];
    return prisma.team.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: 20,
    });
  }

  async getTeamById(externalId: number) {
    let team = await prisma.team.findFirst({ where: { externalId } });
    if (team) return team;

    const raw = await apiFootballService.getTeamById(externalId);
    const t = (raw as any[])?.[0];
    if (!t) return null;

    team = await prisma.team.upsert({
      where: { externalId },
      create: {
        externalId: t.team.id,
        name: t.team.name,
        logo: t.team.logo,
        country: t.team.country,
        founded: t.team.founded,
        stadium: t.venue?.name,
        capacity: t.venue?.capacity,
      },
      update: { logo: t.team.logo },
    });
    return team;
  }

  async getTeamStatistics(teamId: number, season: number, leagueId?: number) {
    const effectiveLeague = leagueId || 39; // Default to Premier League
    const raw = await apiFootballService.getTeamStatistics(teamId, effectiveLeague, season);
    return raw;
  }

  async getRecentMatches(teamId: number) {
    const raw = await apiFootballService.getTeamLastMatches(teamId, 10);
    return raw;
  }

  async getSquad(teamId: number) {
    const raw = await apiFootballService.getSquad(teamId);
    return (raw as any[])?.[0]?.players || [];
  }
}

export const teamsService = new TeamsService();
