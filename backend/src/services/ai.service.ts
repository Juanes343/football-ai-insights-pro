import axios from 'axios';
import { config } from '../config';
import { prisma } from '../db/prisma';
import { logger } from '../utils/logger';
import { apiFootballService } from './apiFootball.service';

interface PredictionRequest {
  matchId: number;
  homeTeamId: number;
  awayTeamId: number;
  leagueId: number;
  season: number;
}

interface PredictionResponse {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  bttsProb: number;
  over25Prob: number;
  under25Prob: number;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  confidence: number;
  analysisText: string;
  featureImportance: Record<string, number>;
  modelVersion: string;
}

class AIService {
  private client = axios.create({
    // El AI Service expone sus rutas bajo el prefijo /api (ej: /api/predict).
    baseURL: `${config.aiService.url}/api`,
    headers: { Authorization: `Bearer ${config.aiService.token}` },
    timeout: 30000,
  });

  async getPrediction(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      // Enriquecer la petición con la forma reciente de cada equipo y el head-to-head.
      const [homeLast, awayLast, h2h] = await Promise.all([
        apiFootballService.getTeamLastMatches(request.homeTeamId, 10).catch(() => []),
        apiFootballService.getTeamLastMatches(request.awayTeamId, 10).catch(() => []),
        apiFootballService.getHeadToHead(request.homeTeamId, request.awayTeamId).catch(() => []),
      ]);

      const simplify = (arr: any[]) =>
        (Array.isArray(arr) ? arr : []).map((f) => ({
          homeTeamId: f.teams?.home?.id,
          awayTeamId: f.teams?.away?.id,
          homeScore: f.goals?.home,
          awayScore: f.goals?.away,
        }));

      const payload = {
        fixtureId: request.matchId,
        homeTeamId: request.homeTeamId,
        awayTeamId: request.awayTeamId,
        leagueId: request.leagueId,
        season: request.season,
        homeLastMatches: simplify(homeLast as any[]),
        awayLastMatches: simplify(awayLast as any[]),
        headToHead: simplify(h2h as any[]),
      };

      const { data } = await this.client.post('/predict', payload);
      return this.mapAIResponse(data);
    } catch (err) {
      logger.error('AI service prediction error:', err);
      // Fallback to statistical model
      return this.statisticalFallback(request);
    }
  }

  /** Adapta la respuesta del AI Service (Python) al formato que usa el backend/BD. */
  private mapAIResponse(d: any): PredictionResponse {
    return {
      homeWinProb: d.homeWinProb,
      drawProb: d.drawProb,
      awayWinProb: d.awayWinProb,
      bttsProb: d.btts ?? 0,
      over25Prob: d.over25 ?? 0,
      under25Prob: d.over25 != null ? 1 - d.over25 : 0,
      predictedHomeGoals: d.expectedHomeGoals ?? 0,
      predictedAwayGoals: d.expectedAwayGoals ?? 0,
      confidence: d.confidence,
      analysisText: `Predicción generada por el modelo ${d.modelVersion ?? '1.0.0'}.`,
      featureImportance: {},
      modelVersion: d.modelVersion ?? '1.0.0',
    };
  }

  private statisticalFallback(request: PredictionRequest): PredictionResponse {
    // Simple Poisson-based fallback when AI service is unavailable
    const base = 0.333;
    const homeAdvantage = 0.05;
    return {
      homeWinProb: base + homeAdvantage,
      drawProb: base,
      awayWinProb: base - homeAdvantage,
      bttsProb: 0.52,
      over25Prob: 0.55,
      under25Prob: 0.45,
      predictedHomeGoals: 1.4,
      predictedAwayGoals: 1.1,
      confidence: 0.45,
      analysisText: 'Prediction based on statistical model (AI service unavailable).',
      featureImportance: {},
      modelVersion: 'fallback-1.0.0',
    };
  }

  async triggerRetraining(): Promise<void> {
    try {
      await this.client.post('/train');
      logger.info('AI retraining triggered');
    } catch (err) {
      logger.error('Failed to trigger retraining:', err);
      throw err;
    }
  }

  async getModelHealth(): Promise<{ status: string; version: string; accuracy: number }> {
    try {
      const { data } = await this.client.get('/health');
      return data;
    } catch {
      return { status: 'unavailable', version: 'unknown', accuracy: 0 };
    }
  }

  async updatePredictionResult(predictionId: string, actualOutcome: string, wasCorrect: boolean): Promise<void> {
    try {
      await prisma.prediction.update({
        where: { id: predictionId },
        data: { actualOutcome: actualOutcome as any, wasCorrect },
      });
      logger.debug(`Updated prediction ${predictionId}: correct=${wasCorrect}`);
    } catch (err) {
      logger.error('Failed to update prediction result:', err);
    }
  }
}

export const aiService = new AIService();
