import { Request, Response, NextFunction } from 'express';
import { predictionsService, serializePrediction } from '../services/predictions.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { prisma } from '../db/prisma';

export async function getPredictionForMatch(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const matchId = parseInt(req.params.matchId);
    const prediction = await predictionsService.getPredictionWithMarkets(matchId, {
      userId: req.user?.id,
      role: req.user?.role,
    });
    res.json({ success: true, data: prediction });
  } catch (err) { next(err); }
}

export async function getTodayPredictions(_req: Request, res: Response, next: NextFunction) {
  try {
    const predictions = await predictionsService.getTodayPredictions();
    res.json({ success: true, data: predictions.map(serializePrediction) });
  } catch (err) { next(err); }
}

export async function getTopPredictions(_req: Request, res: Response, next: NextFunction) {
  try {
    const predictions = await predictionsService.getTopPredictions();
    res.json({ success: true, data: predictions.map(serializePrediction) });
  } catch (err) { next(err); }
}

export async function getPredictionHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const history = await prisma.predictionHistory.findMany({
      where: { userId },
      include: { prediction: { include: { match: { include: { homeTeam: true, awayTeam: true, league: true } } } } },
      orderBy: { savedAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: history });
  } catch (err) { next(err); }
}

export async function getModelMetrics(_req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await prisma.aIModelMetrics.findFirst({ where: { isActive: true } });
    const leagueMetrics = await prisma.aILeagueMetrics.findMany({
      include: { league: { select: { name: true, logo: true } } },
      orderBy: { accuracy: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: { overall: metrics, byLeague: leagueMetrics } });
  } catch (err) { next(err); }
}

export async function getAdvancedPrediction(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const matchId = parseInt(req.params.matchId);
    const prediction = await predictionsService.getAdvancedPrediction(matchId);
    res.json({ success: true, data: prediction });
  } catch (err) { next(err); }
}

export async function getResultsByDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('Fecha inválida. Usa YYYY-MM-DD', 400);
    const data = await predictionsService.evaluateDate(date);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getAccuracy(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await predictionsService.getAccuracySummary();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getWorldCup(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await predictionsService.getWorldCupOverview();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function getTrends(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const trends = await predictionsService.getTrends();
    res.json({ success: true, data: trends });
  } catch (err) { next(err); }
}
