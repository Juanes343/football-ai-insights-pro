import { Router } from 'express';
import * as ctrl from '../controllers/leagues.controller';

const router = Router();

router.get('/', ctrl.getLeagues);
router.get('/top', ctrl.getTopLeagues);
router.get('/:id', ctrl.getLeagueById);
router.get('/:id/standings', ctrl.getStandings);
router.get('/:id/matches', ctrl.getLeagueMatches);
router.get('/:id/top-scorers', ctrl.getTopScorers);

export default router;
