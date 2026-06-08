import { matchesService } from './matches.service';
import { predictionsService } from './predictions.service';
import { aiService } from './ai.service';
import { emitMatchUpdate, emitGoal, emitMatchStatus, emitStandingsUpdate } from './websocket.service';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import { MatchStatus } from '@prisma/client';

// Interval references for cleanup
const intervals: ReturnType<typeof setInterval>[] = [];

export function startSchedulers() {
  // ── Live match updates every 30s ──────────────────────────
  intervals.push(
    setInterval(async () => {
      try {
        const liveMatches = await matchesService.getLiveMatches();
        for (const match of liveMatches as any[]) {
          emitMatchUpdate(match.id, match);
        }
      } catch (err) {
        logger.error('Live match scheduler error:', err);
      }
    }, 30_000)
  );

  // ── Sync today's fixtures every 5 min ────────────────────
  intervals.push(
    setInterval(async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const fixtures = await matchesService.getMatchesByDate(today);
        await upsertMatchesFromAPI(fixtures as any[]);
      } catch (err) {
        logger.error('Fixture sync scheduler error:', err);
      }
    }, 300_000)
  );

  // ── Generate predictions for upcoming matches every hour ──
  intervals.push(
    setInterval(async () => {
      try {
        const upcoming = await prisma.match.findMany({
          where: {
            status: { in: [MatchStatus.SCHEDULED] },
            kickoff: { gte: new Date(), lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
          },
          take: 20,
        });
        for (const match of upcoming) {
          await predictionsService.getPredictionForMatch(match.externalId);
        }
        logger.debug(`Generated predictions for ${upcoming.length} upcoming matches`);
      } catch (err) {
        logger.error('Prediction scheduler error:', err);
      }
    }, 3_600_000)
  );

  // ── Update prediction results every 6 hours ───────────────
  intervals.push(
    setInterval(async () => {
      try {
        await updateFinishedMatchPredictions();
      } catch (err) {
        logger.error('Prediction result update error:', err);
      }
    }, 6 * 3_600_000)
  );

  logger.info(`Started ${intervals.length} background schedulers`);
}

async function upsertMatchesFromAPI(fixtures: any[]) {
  // 'fixtures' ya viene normalizado por matchesService (formato plano del frontend).
  for (const f of fixtures) {
    if (!f.externalId) continue;
    try {
      // Find or create league
      let league = await prisma.league.findFirst({ where: { externalId: f.league.externalId } });
      if (!league) {
        league = await prisma.league.create({
          data: {
            externalId: f.league.externalId, name: f.league.name, country: f.league.country,
            logo: f.league.logo, season: f.league.season || new Date().getFullYear(),
          },
        });
      }

      // Find or create teams
      const upsertTeam = async (t: any) => {
        return prisma.team.upsert({
          where: { externalId: t.externalId },
          create: { externalId: t.externalId, name: t.name, logo: t.logo },
          update: { logo: t.logo },
        });
      };

      const [homeTeam, awayTeam] = await Promise.all([upsertTeam(f.homeTeam), upsertTeam(f.awayTeam)]);

      // Upsert match
      await prisma.match.upsert({
        where: { externalId: f.externalId },
        create: {
          externalId: f.externalId, leagueId: league.id,
          homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
          kickoff: new Date(f.startTime),
          status: f.status as MatchStatus,
          homeScore: f.homeScore, awayScore: f.awayScore,
          minute: f.minute,
        },
        update: {
          status: f.status as MatchStatus,
          homeScore: f.homeScore, awayScore: f.awayScore,
          minute: f.minute,
        },
      });
    } catch (err) {
      logger.debug('Match upsert error:', err);
    }
  }
}

async function updateFinishedMatchPredictions() {
  const finished = await prisma.match.findMany({
    where: { status: MatchStatus.FINISHED },
    include: { predictions: { where: { wasCorrect: null } } },
  });

  for (const match of finished) {
    for (const pred of match.predictions) {
      if (match.homeScore === null || match.awayScore === null) continue;

      let actualOutcome: string;
      if (match.homeScore > match.awayScore) actualOutcome = 'HOME_WIN';
      else if (match.homeScore === match.awayScore) actualOutcome = 'DRAW';
      else actualOutcome = 'AWAY_WIN';

      const wasCorrect = pred.predictedOutcome === actualOutcome;
      await aiService.updatePredictionResult(pred.id, actualOutcome, wasCorrect);
    }
  }
}
