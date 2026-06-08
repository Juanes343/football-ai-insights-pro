import { Request, Response, NextFunction } from 'express';
import { leaguesService } from '../services/leagues.service';

export async function getLeagues(_req: Request, res: Response, next: NextFunction) {
  try {
    const leagues = await leaguesService.getLeagues();
    res.json({ success: true, data: leagues });
  } catch (err) { next(err); }
}

export async function getTopLeagues(_req: Request, res: Response, next: NextFunction) {
  try {
    const leagues = await leaguesService.getTopLeagues();
    res.json({ success: true, data: leagues });
  } catch (err) { next(err); }
}

export async function getLeagueById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const league = await leaguesService.getLeagueById(id);
    res.json({ success: true, data: league });
  } catch (err) { next(err); }
}

export async function getStandings(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const standings = await leaguesService.getStandings(id);
    res.json({ success: true, data: standings });
  } catch (err) { next(err); }
}

export async function getLeagueMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const season = req.query.season ? parseInt(req.query.season as string) : new Date().getFullYear();
    const matches = await leaguesService.getLeagueMatches(id, season);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
}

export async function getTopScorers(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const season = req.query.season ? parseInt(req.query.season as string) : new Date().getFullYear();
    const scorers = await leaguesService.getTopScorers(id, season);
    res.json({ success: true, data: scorers });
  } catch (err) { next(err); }
}
