import { Router } from 'express';
import * as ctrl from '../controllers/predictions.controller';
import { authenticate, requirePremium } from '../middleware/auth';
import { predictionLimiter } from '../middleware/rateLimit';

const router = Router();

router.get('/match/:matchId', predictionLimiter, ctrl.getPredictionForMatch);
router.get('/today', ctrl.getTodayPredictions);
router.get('/top', ctrl.getTopPredictions);
router.get('/worldcup', ctrl.getWorldCup);
router.get('/accuracy', ctrl.getAccuracy);
router.get('/results/:date', ctrl.getResultsByDate);
router.get('/history', authenticate, ctrl.getPredictionHistory);
router.get('/model-metrics', ctrl.getModelMetrics);

// Premium features
router.get('/advanced/:matchId', authenticate, requirePremium, ctrl.getAdvancedPrediction);
router.get('/trends', authenticate, requirePremium, ctrl.getTrends);

export default router;
