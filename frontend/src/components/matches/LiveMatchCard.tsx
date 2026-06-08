'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatTime, getStatusColor, getStatusLabel } from '@/lib/utils';
import type { Match } from '@/types';
import Image from 'next/image';

interface Props {
  match: Match;
  showPrediction?: boolean;
}

export function LiveMatchCard({ match, showPrediction }: Props) {
  const isLive = match.status === 'LIVE';

  return (
    <Link href={`/matches/${match.externalId}`}>
      <Card className={cn('hover:border-primary/50 transition-all cursor-pointer', isLive && 'border-red-500/30')}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {match.league.logo && (
                <Image src={match.league.logo} alt={match.league.name} width={16} height={16} className="rounded-sm" />
              )}
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">{match.league.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {isLive && <span className="live-dot" />}
              <span className={cn('text-xs font-medium', getStatusColor(match.status))}>
                {isLive && match.minute ? `${match.minute}'` : getStatusLabel(match.status)}
              </span>
            </div>
          </div>

          {/* Score row */}
          <div className="flex items-center justify-between gap-2">
            {/* Home */}
            <div className="flex-1 flex items-center gap-2">
              {match.homeTeam.logo && (
                <Image src={match.homeTeam.logo} alt={match.homeTeam.name} width={24} height={24} />
              )}
              <span className="text-sm font-medium truncate">{match.homeTeam.name}</span>
            </div>

            {/* Score / Time */}
            <div className="flex items-center gap-2 px-3">
              {match.homeScore !== null ? (
                <span className="text-xl font-bold tabular-nums">
                  {match.homeScore} – {match.awayScore}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">{formatTime(match.startTime)}</span>
              )}
            </div>

            {/* Away */}
            <div className="flex-1 flex items-center justify-end gap-2">
              <span className="text-sm font-medium truncate text-right">{match.awayTeam.name}</span>
              {match.awayTeam.logo && (
                <Image src={match.awayTeam.logo} alt={match.awayTeam.name} width={24} height={24} />
              )}
            </div>
          </div>

          {/* Prediction bar */}
          {showPrediction && match.prediction && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="flex rounded-full overflow-hidden h-2">
                <div className="bg-green-500" style={{ width: `${match.prediction.homeWinProb * 100}%` }} />
                <div className="bg-yellow-500" style={{ width: `${match.prediction.drawProb * 100}%` }} />
                <div className="bg-blue-500" style={{ width: `${match.prediction.awayWinProb * 100}%` }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>{Math.round(match.prediction.homeWinProb * 100)}%</span>
                <span>{Math.round(match.prediction.drawProb * 100)}%</span>
                <span>{Math.round(match.prediction.awayWinProb * 100)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
