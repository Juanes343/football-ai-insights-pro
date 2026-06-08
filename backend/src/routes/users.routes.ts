import { Router } from 'express';
import * as ctrl from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

router.get('/profile', authenticate, ctrl.getProfile);
router.patch(
  '/profile',
  authenticate,
  [body('name').optional().trim().isLength({ min: 2, max: 50 })],
  ctrl.updateProfile
);
router.patch('/change-password', authenticate, ctrl.changePassword);
router.get('/favorites', authenticate, ctrl.getFavorites);
router.post('/favorites/team/:teamId', authenticate, ctrl.toggleFavoriteTeam);
router.post('/favorites/league/:leagueId', authenticate, ctrl.toggleFavoriteLeague);
router.get('/prediction-stats', authenticate, ctrl.getPredictionStats);
router.delete('/account', authenticate, ctrl.deleteAccount);

// Premium / Subscription
router.post('/subscribe', authenticate, ctrl.createSubscription);
router.post('/cancel-subscription', authenticate, ctrl.cancelSubscription);
router.get('/subscription', authenticate, ctrl.getSubscription);

// Admin
router.get('/', authenticate, requireAdmin, ctrl.getAllUsers);

export default router;
