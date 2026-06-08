import { Router } from 'express';
import * as ctrl from '../controllers/teams.controller';

const router = Router();

router.get('/search', ctrl.searchTeams);
router.get('/:id', ctrl.getTeamById);
router.get('/:id/statistics', ctrl.getTeamStatistics);
router.get('/:id/recent', ctrl.getRecentMatches);
router.get('/:id/squad', ctrl.getSquad);

export default router;
