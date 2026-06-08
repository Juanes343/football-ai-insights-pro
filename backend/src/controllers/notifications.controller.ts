import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: notifications });
  } catch (err) { next(err); }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.notification.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    });
    res.json({ success: true });
  } catch (err) { next(err); }
}

export async function updatePreferences(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    res.json({ success: true, message: 'Preferences updated' });
  } catch (err) { next(err); }
}

export async function teamsController(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true });
  } catch (err) { next(err); }
}
