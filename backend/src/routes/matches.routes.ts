import { Router } from 'express';
import * as ctrl from '../controllers/matches.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/live', ctrl.getLiveMatches);
router.get('/today', ctrl.getTodayMatches);
router.get('/date/:date', ctrl.getMatchesByDate);
router.get('/:id', ctrl.getMatchById);
router.get('/:id/statistics', ctrl.getMatchStatistics);
router.get('/:id/events', ctrl.getMatchEvents);
router.get('/:id/lineups', ctrl.getMatchLineups);
router.get('/:id/h2h', ctrl.getHeadToHead);

// Authenticated
router.post('/:id/favorite', authenticate, ctrl.toggleFavoriteMatch);

export default router;
