import { Request, Response, NextFunction } from 'express';
import { teamsService } from '../services/teams.service';

export async function searchTeams(req: Request, res: Response, next: NextFunction) {
  try {
    const q = req.query.q as string;
    const teams = await teamsService.searchTeams(q);
    res.json({ success: true, data: teams });
  } catch (err) { next(err); }
}

export async function getTeamById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const team = await teamsService.getTeamById(id);
    res.json({ success: true, data: team });
  } catch (err) { next(err); }
}

export async function getTeamStatistics(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const season = req.query.season ? parseInt(req.query.season as string) : new Date().getFullYear();
    const leagueId = req.query.leagueId ? parseInt(req.query.leagueId as string) : undefined;
    const stats = await teamsService.getTeamStatistics(id, season, leagueId);
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
}

export async function getRecentMatches(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const matches = await teamsService.getRecentMatches(id);
    res.json({ success: true, data: matches });
  } catch (err) { next(err); }
}

export async function getSquad(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    const squad = await teamsService.getSquad(id);
    res.json({ success: true, data: squad });
  } catch (err) { next(err); }
}
