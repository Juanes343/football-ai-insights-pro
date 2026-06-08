import { prisma } from '../db/prisma';
import { aiService } from './ai.service';
import { matchesService } from './matches.service';
import { apiFootballService } from './apiFootball.service';
import { cacheService } from './cache.service';
import { logger } from '../utils/logger';
import { PredictionOutcome } from '@prisma/client';

/**
 * Convierte una predicción (formato BD) al formato que espera el frontend:
 * renombra bttsProb→btts, over25Prob→over25, predictedHomeGoals→expectedHomeGoals, etc.
 * Si la predicción incluye el partido, lo adapta también (kickoff→startTime).
 */
export function serializePrediction(p: any): any {
  if (!p) return p;
  return {
    id: p.id,
    matchId: p.matchId,
    predictedOutcome: p.predictedOutcome,
    homeWinProb: p.homeWinProb,
    drawProb: p.drawProb,
    awayWinProb: p.awayWinProb,
    confidence: p.confidence,
    expectedHomeGoals: p.predictedHomeGoals ?? null,
    expectedAwayGoals: p.predictedAwayGoals ?? null,
    btts: p.bttsProb ?? null,
    over25: p.over25Prob ?? null,
    modelVersion: p.modelVersion ?? null,
    provider: p.provider ?? 'model',
    advice: p.advice ?? null,
    comparison: p.comparison ?? null,
    secondOpinion: p.secondOpinion ?? null,
    createdAt: p.createdAt,
    match: p.match
      ? {
          id: String(p.match.externalId ?? p.match.id),
          externalId: p.match.externalId,
          homeTeam: p.match.homeTeam,
          awayTeam: p.match.awayTeam,
          league: p.match.league,
          startTime: p.match.kickoff,
          status: p.match.status,
          homeScore: p.match.homeScore,
          awayScore: p.match.awayScore,
        }
      : undefined,
  };
}

class PredictionsService {
  async getPredictionForMatch(fixtureId: number) {
    const cacheKey = `prediction:${fixtureId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    // Try DB first
    let match = await prisma.match.findFirst({ where: { externalId: fixtureId } });
    if (match) {
      const existing = await prisma.prediction.findFirst({
        where: { matchId: match.id },
        orderBy: { createdAt: 'desc' },
      });
      if (existing) {
        await cacheService.set(cacheKey, existing, 3600);
        return existing;
      }
    }

    // Datos del partido
    const matchData = await matchesService.getMatchById(fixtureId);
    if (!matchData) return null;

    // Dos fuentes en paralelo: predicción del API y nuestro modelo
    const [apiRaw, our] = await Promise.all([
      apiFootballService.getApiPredictions(fixtureId).catch(() => null),
      aiService.getPrediction({
        matchId: fixtureId,
        homeTeamId: matchData.homeTeam.externalId,
        awayTeamId: matchData.awayTeam.externalId,
        leagueId: matchData.league.externalId,
        season: matchData.league.season,
      }),
    ]);

    const api = this.parseApiPrediction(apiRaw);
    const ourOutcome = this.outcomeFromProbs(our.homeWinProb, our.drawProb, our.awayWinProb);

    // Elegir fuente principal: API si tiene datos válidos (clubes), si no, nuestro modelo (Mundial)
    let primaryProbs: { home: number; draw: number; away: number };
    let provider: string;
    let advice: string | null;
    let comparison: any = null;
    let secondOpinion: any = null;

    if (api.valid) {
      primaryProbs = { home: api.homeWinProb, draw: api.drawProb, away: api.awayWinProb };
      provider = 'api';
      advice = api.advice;
      comparison = api.comparison;
      secondOpinion = {
        provider: 'model',
        homeWinProb: our.homeWinProb,
        drawProb: our.drawProb,
        awayWinProb: our.awayWinProb,
        confidence: our.confidence,
        predictedOutcome: ourOutcome,
      };
    } else {
      primaryProbs = { home: our.homeWinProb, draw: our.drawProb, away: our.awayWinProb };
      provider = 'model';
      advice = our.analysisText ?? null;
      // El API no tiene predicción (ej. Mundial): no hay segunda opinión externa
      secondOpinion = null;
    }

    const predictedOutcome = this.outcomeFromProbs(
      primaryProbs.home, primaryProbs.draw, primaryProbs.away,
    ) as PredictionOutcome;
    const confidence = Math.max(primaryProbs.home, primaryProbs.draw, primaryProbs.away);
    const modelVersion = provider === 'api' ? 'api-1.0.0' : our.modelVersion;

    // Asegurar que el partido exista en la BD para poder guardar la predicción
    if (!match) {
      match = await this.persistMatch(matchData);
    }

    const data = {
      modelVersion,
      provider,
      homeWinProb: primaryProbs.home,
      drawProb: primaryProbs.draw,
      awayWinProb: primaryProbs.away,
      bttsProb: our.bttsProb,
      over25Prob: our.over25Prob,
      under25Prob: our.under25Prob,
      predictedHomeGoals: our.predictedHomeGoals,
      predictedAwayGoals: our.predictedAwayGoals,
      predictedOutcome,
      confidence,
      analysisText: advice,
      advice,
      comparison,
      secondOpinion,
    };

    const prediction = await prisma.prediction.upsert({
      where: { matchId_modelVersion: { matchId: match.id, modelVersion } },
      create: { matchId: match.id, ...data },
      update: data,
    });

    await cacheService.set(cacheKey, prediction, 3600);
    return prediction;
  }

  /** Determina el resultado (enum) a partir de las 3 probabilidades. */
  private outcomeFromProbs(home: number, draw: number, away: number): PredictionOutcome {
    const max = Math.max(home, draw, away);
    if (max === home) return PredictionOutcome.HOME_WIN;
    if (max === draw) return PredictionOutcome.DRAW;
    return PredictionOutcome.AWAY_WIN;
  }

  /**
   * Parsea la predicción cruda de API-Football.
   * Es "válida" solo si trae datos reales (en el Mundial 2026 devuelve 33/33/33
   * y "No predictions available" porque la competencia aún no se juega).
   */
  private parseApiPrediction(raw: any): {
    valid: boolean;
    homeWinProb: number;
    drawProb: number;
    awayWinProb: number;
    advice: string | null;
    comparison: any;
  } {
    const empty = { valid: false, homeWinProb: 0, drawProb: 0, awayWinProb: 0, advice: null, comparison: null };
    const pct = raw?.predictions?.percent;
    if (!pct) return empty;

    const h = parseFloat(pct.home) || 0;
    const d = parseFloat(pct.draw) || 0;
    const a = parseFloat(pct.away) || 0;
    const total = h + d + a;
    const advice: string = raw?.predictions?.advice || '';
    const allEqual = pct.home === pct.draw && pct.draw === pct.away;

    if (total <= 0 || allEqual || !advice || advice === 'No predictions available') {
      return empty;
    }

    return {
      valid: true,
      homeWinProb: h / total,
      drawProb: d / total,
      awayWinProb: a / total,
      advice,
      comparison: raw?.comparison ?? null,
    };
  }

  async getTodayPredictions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.prediction.findMany({
      where: { match: { kickoff: { gte: today, lt: tomorrow } } },
      include: { match: { include: { homeTeam: true, awayTeam: true, league: true } } },
      orderBy: { confidence: 'desc' },
    });
  }

  async getTopPredictions() {
    return prisma.prediction.findMany({
      where: { confidence: { gte: 0.35 } },
      include: { match: { include: { homeTeam: true, awayTeam: true, league: true } } },
      orderBy: { confidence: 'desc' },
      take: 10,
    });
  }

  /**
   * Resumen del Mundial 2026: partidos por grupo, cada uno con su predicción,
   * y una tabla proyectada de cada grupo según los resultados predichos.
   */
  async getWorldCupOverview() {
    const LEAGUE = 1;
    const SEASON = 2026;

    const [fixtures, standingsRaw] = await Promise.all([
      matchesService.getMatchesByLeagueSeason(LEAGUE, SEASON),
      apiFootballService.getStandings(LEAGUE, SEASON).catch(() => []),
    ]);

    // Mapa equipo -> grupo, y orden de grupos, desde standings
    const teamGroup = new Map<number, string>();
    const groupOrder: string[] = [];
    const stRoot: any = Array.isArray(standingsRaw) ? standingsRaw[0] : standingsRaw;
    const groups: any[] = stRoot?.league?.standings ?? [];
    for (const g of groups) {
      for (const row of g) {
        const gname = row.group || 'Grupo';
        // Primer grupo real gana: standings puede traer un grupo extra
        // (ranking de terceros) que reasignaría equipos por error.
        if (row.team?.id != null && !teamGroup.has(row.team.id)) {
          teamGroup.set(row.team.id, gname);
          if (!groupOrder.includes(gname)) groupOrder.push(gname);
        }
      }
    }

    // Predicciones guardadas para estos partidos
    const ids = (fixtures as any[]).map((f) => f.externalId).filter(Boolean);
    const preds = await prisma.prediction.findMany({
      where: { match: { externalId: { in: ids } } },
      include: { match: true },
      orderBy: { createdAt: 'desc' },
    });
    const predByExternal = new Map<number, any>();
    for (const p of preds) {
      const ext = (p as any).match?.externalId;
      if (ext != null && !predByExternal.has(ext)) predByExternal.set(ext, serializePrediction(p));
    }

    // Agrupar partidos por grupo
    const byGroup = new Map<string, any[]>();
    for (const f of fixtures as any[]) {
      const gname = teamGroup.get(f.homeTeam?.externalId) || teamGroup.get(f.awayTeam?.externalId) || 'Otros';
      const match = { ...f, prediction: predByExternal.get(f.externalId) ?? null };
      if (!byGroup.has(gname)) byGroup.set(gname, []);
      byGroup.get(gname)!.push(match);
    }

    // Construir respuesta con tabla proyectada por grupo
    const orderedNames = groupOrder.length ? groupOrder : Array.from(byGroup.keys());
    const result = orderedNames
      .filter((name) => byGroup.has(name))
      .map((name) => {
        const matches = (byGroup.get(name) || []).sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        );
        return { name, matches, table: this.projectGroupTable(matches) };
      });

    return { groups: result };
  }

  /** Calcula la tabla proyectada de un grupo a partir de los resultados predichos. */
  private projectGroupTable(matches: any[]) {
    const stats = new Map<string, any>();
    const ensure = (team: any) => {
      const key = String(team.externalId ?? team.id);
      if (!stats.has(key)) {
        stats.set(key, {
          team: { id: key, name: team.name, logo: team.logo },
          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
        });
      }
      return stats.get(key);
    };

    for (const m of matches) {
      const pred = m.prediction;
      if (!pred) continue;
      const h = ensure(m.homeTeam);
      const a = ensure(m.awayTeam);
      const hg = pred.expectedHomeGoals ?? 0;
      const ag = pred.expectedAwayGoals ?? 0;
      h.played++; a.played++;
      h.gf += hg; h.ga += ag; a.gf += ag; a.ga += hg;
      if (pred.predictedOutcome === 'HOME_WIN') { h.points += 3; h.won++; a.lost++; }
      else if (pred.predictedOutcome === 'AWAY_WIN') { a.points += 3; a.won++; h.lost++; }
      else { h.points += 1; a.points += 1; h.drawn++; a.drawn++; }
    }

    return Array.from(stats.values())
      .map((s) => ({ ...s, gf: Math.round(s.gf * 10) / 10, ga: Math.round(s.ga * 10) / 10, gd: Math.round((s.gf - s.ga) * 10) / 10 }))
      .sort((x, y) => y.points - x.points || y.gd - x.gd || y.gf - x.gf);
  }

  /** Guarda en la BD el partido (con su liga y equipos) a partir del formato normalizado. */
  private async persistMatch(m: any) {
    let league = await prisma.league.findFirst({ where: { externalId: m.league.externalId } });
    if (!league) {
      league = await prisma.league.create({
        data: {
          externalId: m.league.externalId,
          name: m.league.name,
          country: m.league.country || '',
          logo: m.league.logo,
          season: m.league.season || new Date().getFullYear(),
        },
      });
    }

    const upsertTeam = (t: any) =>
      prisma.team.upsert({
        where: { externalId: t.externalId },
        create: { externalId: t.externalId, name: t.name, logo: t.logo },
        update: { logo: t.logo },
      });

    const [homeTeam, awayTeam] = await Promise.all([upsertTeam(m.homeTeam), upsertTeam(m.awayTeam)]);

    return prisma.match.upsert({
      where: { externalId: m.externalId },
      create: {
        externalId: m.externalId,
        leagueId: league.id,
        homeTeamId: homeTeam.id,
        awayTeamId: awayTeam.id,
        kickoff: m.startTime ? new Date(m.startTime) : new Date(),
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        minute: m.minute,
      },
      update: {
        status: m.status,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        minute: m.minute,
      },
    });
  }

  async getAdvancedPrediction(fixtureId: number) {
    const base = await this.getPredictionForMatch(fixtureId);
    const match = await matchesService.getMatchById(fixtureId);
    const [homeRecent, awayRecent] = await Promise.all([
      match ? this.getTeamForm(match.homeTeam.externalId) : Promise.resolve([]),
      match ? this.getTeamForm(match.awayTeam.externalId) : Promise.resolve([]),
    ]);
    return { ...base as object, homeForm: homeRecent, awayForm: awayRecent };
  }

  private async getTeamForm(teamId: number) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeam: { externalId: teamId } }, { awayTeam: { externalId: teamId } }],
        status: 'FINISHED',
      },
      orderBy: { kickoff: 'desc' },
      take: 10,
      include: { homeTeam: true, awayTeam: true },
    });
    return matches;
  }

  async getTrends() {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const predictions = await prisma.prediction.findMany({
      where: { createdAt: { gte: last7Days }, wasCorrect: { not: null } },
    });

    const total = predictions.length;
    const correct = predictions.filter((p) => p.wasCorrect).length;

    return {
      accuracy7Days: total > 0 ? correct / total : 0,
      totalPredictions: total,
      correctPredictions: correct,
      avgConfidence: total > 0 ? predictions.reduce((s, p) => s + p.confidence, 0) / total : 0,
    };
  }
}

export const predictionsService = new PredictionsService();
