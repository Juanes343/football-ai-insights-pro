'use client';

import { useEffect } from 'react';
import { useMatch } from '@/hooks/useMatches';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useMatchPrediction } from '@/hooks/usePredictions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PredictionCard } from '@/components/predictions/PredictionCard';
import { MatchStatisticsView } from './MatchStatisticsView';
import { EventTimeline } from './EventTimeline';
import { cn, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';
import Image from 'next/image';

interface Props { matchId: number }

export function MatchDetail({ matchId }: Props) {
  const { data: match, isLoading } = useMatch(matchId);
  const { data: prediction } = useMatchPrediction(matchId);
  const { subscribeToMatch, unsubscribeFromMatch } = useWebSocket();

  useEffect(() => {
    if (match?.id) {
      subscribeToMatch(match.id);
      return () => unsubscribeFromMatch(match.id);
    }
  }, [match?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return <div className="h-64 rounded-xl bg-card border border-border animate-pulse" />;
  }

  if (!match) {
    return <p className="text-center text-muted-foreground py-16">Partido no encontrado.</p>;
  }

  const isLive = match.status === 'LIVE';

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Score card */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-4">
            <span className={cn('text-sm font-medium', getStatusColor(match.status))}>
              {isLive && match.minute ? `${match.minute}' — ` : ''}{getStatusLabel(match.status)}
            </span>
            {isLive && <span className="ml-2 live-dot" />}
          </div>
          <div className="flex items-center justify-between gap-6">
            <TeamDisplay name={match.homeTeam.name} logo={match.homeTeam.logo} />
            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums">
                {match.homeScore ?? '–'} : {match.awayScore ?? '–'}
              </div>
              {match.htHomeScore !== null && (
                <p className="text-xs text-muted-foreground mt-2">
                  Medio tiempo: {match.htHomeScore} – {match.htAwayScore}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{formatDate(match.startTime, { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <TeamDisplay name={match.awayTeam.name} logo={match.awayTeam.logo} align="right" />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: events + stats */}
        <div className="lg:col-span-2 space-y-6">
          {match.events && match.events.length > 0 && (
            <EventTimeline events={match.events} homeTeamId={match.homeTeam.id} />
          )}
          {match.statistics && match.statistics.length > 0 && (
            <MatchStatisticsView statistics={match.statistics} homeTeam={match.homeTeam.name} awayTeam={match.awayTeam.name} />
          )}
        </div>

        {/* Right: prediction */}
        <div>
          {prediction && <PredictionCard prediction={prediction} />}
        </div>
      </div>
    </div>
  );
}

function TeamDisplay({ name, logo, align = 'left' }: { name: string; logo: string | null; align?: 'left' | 'right' }) {
  return (
    <div className={cn('flex flex-col items-center gap-2 flex-1', align === 'right' && '')}>
      {logo && <Image src={logo} alt={name} width={64} height={64} />}
      <p className="font-semibold text-center text-lg leading-tight">{name}</p>
    </div>
  );
}
