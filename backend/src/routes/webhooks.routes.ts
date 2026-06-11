import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { config } from '../config';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';

const router = Router();
const stripe = new Stripe(config.stripe.secretKey);

router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
  } catch (err) {
    logger.warn('Stripe webhook signature verification failed');
    return res.status(400).send('Webhook signature verification failed');
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status === 'active' ? 'ACTIVE' : sub.status === 'canceled' ? 'CANCELLED' : 'INACTIVE',
          currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data: { status: 'PAST_DUE' },
      });
      break;
    }
  }

  res.json({ received: true });
});

/**
 * Webhook de RevenueCat. Activa/desactiva el rol PREMIUM del usuario.
 * Configura en RevenueCat → Project settings → Webhooks:
 *   URL: https://<backend>/api/webhooks/revenuecat
 *   Authorization header: Bearer <REVENUECAT_WEBHOOK_AUTH>
 */
router.post('/revenuecat', async (req: Request, res: Response) => {
  const secret = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ ok: false });
  }

  const event = (req.body && req.body.event) || {};
  const appUserId: string | undefined = event.app_user_id;
  const type: string = event.type || '';
  const ACTIVE = ['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE'];

  try {
    if (appUserId) {
      const user = await prisma.user.findUnique({ where: { id: appUserId } });
      if (user && user.role !== 'ADMIN') {
        if (ACTIVE.includes(type)) {
          await prisma.user.update({ where: { id: user.id }, data: { role: 'PREMIUM' } });
          logger.info(`RevenueCat: ${user.email} → PREMIUM (${type})`);
        } else if (type === 'EXPIRATION') {
          await prisma.user.update({ where: { id: user.id }, data: { role: 'USER' } });
          logger.info(`RevenueCat: ${user.email} → USER (expirado)`);
        }
      }
    }
  } catch (err) {
    logger.warn('RevenueCat webhook error:', err);
  }

  res.json({ ok: true });
});

export default router;
