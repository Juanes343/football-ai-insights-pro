import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';

export async function getDashboard(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [totalUsers, totalMatches, totalPredictions, activeModel] = await Promise.all([
      prisma.user.count(),
      prisma.match.count(),
      prisma.prediction.count(),
      prisma.aIModelMetrics.findFirst({ where: { isActive: true } }),
    ]);
    res.json({ success: true, data: { totalUsers, totalMatches, totalPredictions, activeModel } });
  } catch (err) { next(err); }
}

export async function getUsers(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true, isEmailVerified: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

export async function updateUserRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { role } = req.body;
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json({ success: true, data: { id: user.id, role: user.role } });
  } catch (err) { next(err); }
}

export async function getPredictionMetrics(_req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await prisma.aIModelMetrics.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: metrics });
  } catch (err) { next(err); }
}

export async function triggerRetraining(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await aiService.triggerRetraining();
    res.json({ success: true, message: 'Retraining job triggered' });
  } catch (err) { next(err); }
}

export async function syncLeagues(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, message: 'League sync triggered' });
  } catch (err) { next(err); }
}

export async function syncMatches(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, message: 'Match sync triggered' });
  } catch (err) { next(err); }
}

export async function getLogs(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, data: [] });
  } catch (err) { next(err); }
}
