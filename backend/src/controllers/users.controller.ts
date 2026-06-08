import { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import Stripe from 'stripe';
import { config } from '../config';

const stripe = new Stripe(config.stripe.secretKey);

export async function getProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, name: true, avatar: true, role: true,
        isEmailVerified: true, createdAt: true, lastLoginAt: true,
        subscription: { select: { status: true, currentPeriodEnd: true } },
        favoriteTeams: { include: { team: true } },
        favoriteLeagues: { include: { league: true } },
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { ...(name && { name }), ...(avatar && { avatar }) },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.passwordHash) throw new AppError('Cannot change password for OAuth accounts', 400);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

    res.json({ success: true, message: 'Password changed' });
  } catch (err) { next(err); }
}

export async function getFavorites(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const [teams, leagues] = await Promise.all([
      prisma.favoriteTeam.findMany({ where: { userId }, include: { team: true } }),
      prisma.favoriteLeague.findMany({ where: { userId }, include: { league: true } }),
    ]);
    res.json({ success: true, data: { teams, leagues } });
  } catch (err) { next(err); }
}

export async function toggleFavoriteTeam(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const team = await prisma.team.findFirst({ where: { externalId: parseInt(req.params.teamId) } });
    if (!team) throw new AppError('Team not found', 404);

    const existing = await prisma.favoriteTeam.findUnique({ where: { userId_teamId: { userId, teamId: team.id } } });
    if (existing) {
      await prisma.favoriteTeam.delete({ where: { userId_teamId: { userId, teamId: team.id } } });
      res.json({ success: true, data: { favorited: false } });
    } else {
      await prisma.favoriteTeam.create({ data: { userId, teamId: team.id } });
      res.json({ success: true, data: { favorited: true } });
    }
  } catch (err) { next(err); }
}

export async function toggleFavoriteLeague(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const league = await prisma.league.findFirst({ where: { externalId: parseInt(req.params.leagueId) } });
    if (!league) throw new AppError('League not found', 404);

    const existing = await prisma.favoriteLeague.findUnique({ where: { userId_leagueId: { userId, leagueId: league.id } } });
    if (existing) {
      await prisma.favoriteLeague.delete({ where: { userId_leagueId: { userId, leagueId: league.id } } });
      res.json({ success: true, data: { favorited: false } });
    } else {
      await prisma.favoriteLeague.create({ data: { userId, leagueId: league.id } });
      res.json({ success: true, data: { favorited: true } });
    }
  } catch (err) { next(err); }
}

export async function getPredictionStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const history = await prisma.predictionHistory.findMany({
      where: { userId },
      include: { prediction: true },
    });
    const total = history.length;
    const withResult = history.filter((h) => h.prediction.wasCorrect !== null);
    const correct = withResult.filter((h) => h.prediction.wasCorrect).length;
    res.json({
      success: true,
      data: { total, withResult: withResult.length, correct, accuracy: withResult.length > 0 ? correct / withResult.length : 0 },
    });
  } catch (err) { next(err); }
}

export async function deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) { next(err); }
}

export async function createSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, include: { subscription: true } });
    if (!user) throw new AppError('User not found', 404);

    let customerId = user.subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: config.stripe.premiumPriceId, quantity: 1 }],
      success_url: `${config.app.frontendUrl}/subscription/success`,
      cancel_url: `${config.app.frontendUrl}/subscription/cancel`,
    });

    res.json({ success: true, data: { checkoutUrl: session.url } });
  } catch (err) { next(err); }
}

export async function cancelSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
    if (!sub?.stripeSubscriptionId) throw new AppError('No active subscription', 400);

    await stripe.subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true });
    await prisma.subscription.update({ where: { userId: req.user!.id }, data: { cancelAtPeriodEnd: true } });

    res.json({ success: true, message: 'Subscription will be cancelled at period end' });
  } catch (err) { next(err); }
}

export async function getSubscription(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.id } });
    res.json({ success: true, data: sub });
  } catch (err) { next(err); }
}

export async function getAllUsers(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
}

export async function teams(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ success: true });
  } catch (err) { next(err); }
}
