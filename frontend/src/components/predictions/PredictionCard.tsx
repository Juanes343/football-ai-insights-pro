'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, formatPercent, getConfidenceBadge, getOutcomeColor, getOutcomeLabel, translateAdvice, topScorelines } from '@/lib/utils';
import type { Prediction, PredictionComparison } from '@/types';

interface Props {
  prediction: Prediction;
  compact?: boolean;
}

export function PredictionCard({ prediction, compact }: Props) {
  const conf = getConfidenceBadge(prediction.confidence);
  const isApi = prediction.provider === 'api';
  const sourceLabel = isApi ? 'Predicción API-Football' : 'Predicción IA propia';

  const chartData = [
    { name: 'Gana local', value: Math.round(prediction.homeWinProb * 100), fill: '#22c55e' },
    { name: 'Empate', value: Math.round(prediction.drawProb * 100), fill: '#eab308' },
    { name: 'Gana visitante', value: Math.round(prediction.awayWinProb * 100), fill: '#3b82f6' },
  ];

  return (
    <Card className={cn(compact && 'border-0 shadow-none')}>
      {!compact && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{sourceLabel}</CardTitle>
            <Badge className={conf.className}>Confianza {conf.label}</Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className={cn('space-y-4', compact && 'p-0')}>
        {/* Predicted outcome */}
        <div className="text-center">
          <p className={cn('text-xl font-bold', getOutcomeColor(prediction.predictedOutcome))}>
            {getOutcomeLabel(prediction.predictedOutcome)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatPercent(prediction.confidence)} de confianza
          </p>
        </div>

        {/* Probability bars */}
        <div className="space-y-2">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span className="w-20 text-muted-foreground text-xs">{item.name}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, background: item.fill }} />
              </div>
              <span className="w-8 text-right text-xs font-medium">{item.value}%</span>
            </div>
          ))}
        </div>

        {/* Additional stats */}
        {(prediction.expectedHomeGoals || prediction.btts !== null) && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            {prediction.expectedHomeGoals !== null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">xG</p>
                <p className="font-semibold text-sm">
                  {prediction.expectedHomeGoals?.toFixed(1)} – {prediction.expectedAwayGoals?.toFixed(1)}
                </p>
              </div>
            )}
            {prediction.btts !== null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Ambos marcan</p>
                <p className="font-semibold text-sm">{formatPercent(prediction.btts!)}</p>
              </div>
            )}
            {prediction.over25 !== null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground">+2.5 goles</p>
                <p className="font-semibold text-sm">{formatPercent(prediction.over25!)}</p>
              </div>
            )}
          </div>
        )}

        {/* Marcador más probable (para pollas) */}
        {!compact && prediction.expectedHomeGoals != null && prediction.expectedAwayGoals != null && (
          (() => {
            const scores = topScorelines(prediction.expectedHomeGoals!, prediction.expectedAwayGoals!, 3);
            if (scores.length === 0) return null;
            return (
              <div className="rounded-lg bg-secondary/50 border border-border px-3 py-2">
                <p className="text-[11px] text-muted-foreground mb-1">⚽ Marcador más probable</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tabular-nums">{scores[0].label}</span>
                  <span className="text-xs text-muted-foreground">({formatPercent(scores[0].prob)})</span>
                </div>
                <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                  <span>Alternativas:</span>
                  {scores.slice(1).map((s) => (
                    <span key={s.label} className="tabular-nums">{s.label} ({formatPercent(s.prob)})</span>
                  ))}
                </div>
              </div>
            );
          })()
        )}

        {/* Consejo (advice) */}
        {!compact && prediction.advice && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2">
            <p className="text-[11px] text-muted-foreground mb-0.5">Consejo</p>
            <p className="text-sm">{translateAdvice(prediction.advice)}</p>
          </div>
        )}

        {/* Comparativa entre equipos (solo API) */}
        {!compact && prediction.comparison && (
          <ComparisonBars comparison={prediction.comparison} />
        )}

        {/* Segunda opinión (nuestra IA) */}
        {!compact && prediction.secondOpinion && (
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">🤖 Segunda opinión — nuestra IA (XGBoost + Elo)</p>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={cn('font-semibold', getOutcomeColor(prediction.secondOpinion.predictedOutcome))}>
                {getOutcomeLabel(prediction.secondOpinion.predictedOutcome)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatPercent(prediction.secondOpinion.confidence)} de confianza
              </span>
            </div>

            {/* Barras de probabilidad de la 2ª opinión */}
            <div className="space-y-1">
              {[
                { name: 'Gana local', value: Math.round(prediction.secondOpinion.homeWinProb * 100), fill: '#22c55e' },
                { name: 'Empate', value: Math.round(prediction.secondOpinion.drawProb * 100), fill: '#eab308' },
                { name: 'Gana visitante', value: Math.round(prediction.secondOpinion.awayWinProb * 100), fill: '#3b82f6' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-muted-foreground">{item.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, background: item.fill }} />
                  </div>
                  <span className="w-8 text-right tabular-nums">{item.value}%</span>
                </div>
              ))}
            </div>

            {/* ¿Coincide con la predicción principal? */}
            {prediction.secondOpinion.predictedOutcome === prediction.predictedOutcome ? (
              <p className="text-[11px] text-green-400">✓ Coincide con la predicción principal</p>
            ) : (
              <p className="text-[11px] text-yellow-400">
                ⚠ Difiere: nuestra IA se inclina por “{getOutcomeLabel(prediction.secondOpinion.predictedOutcome)}”
              </p>
            )}
          </div>
        )}

        {/* Fuente */}
        <p className="text-[10px] text-muted-foreground text-right">
          {isApi ? 'Fuente: API-Football' : `Nuestro modelo ${prediction.modelVersion ?? ''}`}
        </p>
      </CardContent>
    </Card>
  );
}

const COMPARISON_LABELS: Record<keyof PredictionComparison, string> = {
  form: 'Forma',
  att: 'Ataque',
  def: 'Defensa',
  poisson_distribution: 'Poisson',
  h2h: 'H2H',
  goals: 'Goles',
  total: 'Total',
};

function ComparisonBars({ comparison }: { comparison: PredictionComparison }) {
  const rows = (Object.keys(COMPARISON_LABELS) as (keyof PredictionComparison)[])
    .filter((k) => comparison[k]?.home && comparison[k]?.away);
  if (rows.length === 0) return null;

  return (
    <div className="pt-2 border-t border-border space-y-1.5">
      <p className="text-[11px] text-muted-foreground">Comparativa</p>
      {rows.map((k) => {
        const home = parseFloat(comparison[k]!.home) || 0;
        const away = parseFloat(comparison[k]!.away) || 0;
        const total = home + away || 1;
        return (
          <div key={k} className="flex items-center gap-2 text-[11px]">
            <span className="w-8 text-right tabular-nums">{Math.round(home)}</span>
            <div className="flex-1 flex h-1.5 rounded-full overflow-hidden bg-secondary">
              <div className="bg-green-500" style={{ width: `${(home / total) * 100}%` }} />
              <div className="bg-blue-500" style={{ width: `${(away / total) * 100}%` }} />
            </div>
            <span className="w-8 tabular-nums">{Math.round(away)}</span>
            <span className="w-14 text-muted-foreground">{COMPARISON_LABELS[k]}</span>
          </div>
        );
      })}
    </div>
  );
}
