'use client';

import { Activity, Brain, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveMatchCard } from '@/components/matches/LiveMatchCard';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import { useLiveMatches } from '@/hooks/useMatches';
import { useTopPredictions, usePredictionTrends } from '@/hooks/usePredictions';

export function DashboardOverview() {
  const { data: liveMatches, isLoading: loadingLive } = useLiveMatches();
  const { data: topPredictions, isLoading: loadingPredictions } = useTopPredictions();
  const { data: trends } = usePredictionTrends();

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Partidos en vivo"
          value={liveMatches?.length ?? '—'}
          color="text-red-400"
        />
        <StatCard
          icon={Brain}
          label="Predicciones de hoy"
          value={topPredictions?.length ?? '—'}
          color="text-primary"
        />
        <StatCard
          icon={TrendingUp}
          label="Precisión (7 días)"
          value={trends ? `${Math.round((trends.accuracy ?? 0) * 100)}%` : '—'}
          color="text-green-400"
        />
        <StatCard
          icon={Calendar}
          label="Versión del modelo"
          value={topPredictions?.[0]?.modelVersion ?? 'v1.0'}
          color="text-blue-400"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live matches */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg">Partidos en vivo</h2>
          {loadingLive ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : liveMatches && liveMatches.length > 0 ? (
            <div className="space-y-3">
              {liveMatches.slice(0, 6).map((m) => (
                <LiveMatchCard key={m.id} match={m} showPrediction />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No hay partidos en vivo en este momento
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top prediction */}
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Mejor pronóstico</h2>
          {loadingPredictions ? (
            <div className="h-48 rounded-xl bg-card border border-border animate-pulse" />
          ) : topPredictions?.[0] ? (
            <PredictionCard prediction={topPredictions[0]} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Aún no hay predicciones
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg bg-card border flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
