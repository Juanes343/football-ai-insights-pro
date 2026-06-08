'use client';

import { PredictionCard } from './PredictionCard';
import { useTopPredictions, useTodayPredictions } from '@/hooks/usePredictions';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { formatTime } from '@/lib/utils';

export function PredictionsHub() {
  const { data: top, isLoading: loadingTop } = useTopPredictions();
  const { data: today, isLoading: loadingToday } = useTodayPredictions();

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold mb-4">Pronósticos de alta confianza</h2>
        {loadingTop ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : top && top.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {top.map((p) => (
              <div key={p.id}>
                {p.match && (
                  <Link href={`/matches/${p.match.id}`} className="text-xs text-muted-foreground hover:text-foreground block mb-2">
                    {p.match.homeTeam.name} vs {p.match.awayTeam.name} · {formatTime(p.match.startTime)}
                  </Link>
                )}
                <PredictionCard prediction={p} compact />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aún no hay predicciones de alta confianza disponibles.</p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Todas las predicciones de hoy</h2>
        {loadingToday ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : today && today.length > 0 ? (
          <div className="space-y-3">
            {today.map((p) => (
              <Card key={p.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  {p.match && (
                    <Link href={`/matches/${p.match.id}`} className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {p.match.homeTeam.name} vs {p.match.awayTeam.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatTime(p.match.startTime)}</p>
                    </Link>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{['L', 'E', 'V'][['HOME_WIN', 'DRAW', 'AWAY_WIN'].indexOf(p.predictedOutcome)]}</span>
                    <span className="font-semibold">{Math.round(p.confidence * 100)}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Aún no hay predicciones para hoy.</p>
        )}
      </section>
    </div>
  );
}
