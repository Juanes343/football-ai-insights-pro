import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.patch('/users/:id/role', ctrl.updateUserRole);
router.get('/predictions/metrics', ctrl.getPredictionMetrics);
router.post('/ai/retrain', ctrl.triggerRetraining);
router.post('/sync/leagues', ctrl.syncLeagues);
router.post('/sync/matches', ctrl.syncMatches);
router.get('/logs', ctrl.getLogs);

export default router;
