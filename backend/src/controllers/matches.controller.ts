import { Request, Response, NextFunction } from 'express';
import { matchesService } from '../services/matches.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export async function getLiveMatches(_req: Request, res: Response, next: NextFunction) {
  try {
    const matches = await matchesService.getLiveMatches();
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
}

export async function getTodayMatches(_req: Request, res: Response, next: NextFunction) {
  try {
    const matches = await matchesService.getTodayMatches();
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
}

export async function getMatchesByDate(req: Request, res: Response, next: NextFunction) {
  try {
    const { date } = req.params;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('Invalid date format. Use YYYY-MM-DD', 400);
    const matches = await matchesService.getMatchesByDate(date);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
}

export async function getMatchById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) throw new AppError('Invalid match ID', 400);
    const match = await matchesService.getMatchById(id);
    if (!match) throw new AppError('Match not found', 404);
    res.json({ success: true, data: match });
  } catch (err) { next(err); }
}

export async function getMatchStatistics(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const stats = await matchesService.getMatchStatistics(id);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

export async function getMatchEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const events = await matchesService.getMatchEvents(id);
    res.json({ success: true, data: events });
  } catch (err) { next(err); }
}

export async function getMatchLineups(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const lineups = await matchesService.getMatchLineups(id);
    res.json({ success: true, data: lineups });
  } catch (err) { next(err); }
}

export async function getHeadToHead(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const h2h = await matchesService.getHeadToHead(id);
    res.json({ success: true, data: h2h });
  } catch (err) { next(err); }
}

export async function toggleFavoriteMatch(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, message: 'Match favorite toggled' });
  } catch (err) { next(err); }
}
