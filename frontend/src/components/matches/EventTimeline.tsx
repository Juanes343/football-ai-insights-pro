'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MatchEvent } from '@/types';
import { Goal, AlertCircle, ArrowLeftRight, Star } from 'lucide-react';

interface Props { events: MatchEvent[]; homeTeamId: string }

function EventIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t.includes('goal')) return <Goal className="w-4 h-4 text-green-400" />;
  if (t.includes('card')) return <div className={cn('w-3 h-4 rounded-sm', t.includes('red') ? 'bg-red-500' : 'bg-yellow-400')} />;
  if (t.includes('subst')) return <ArrowLeftRight className="w-4 h-4 text-blue-400" />;
  return <Star className="w-4 h-4 text-muted-foreground" />;
}

export function EventTimeline({ events, homeTeamId }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Eventos del partido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.map((ev) => {
          const isHome = ev.teamId === homeTeamId;
          return (
            <div key={ev.id} className={cn('flex items-center gap-3 text-sm', isHome ? 'flex-row' : 'flex-row-reverse')}>
              <span className="text-xs text-muted-foreground tabular-nums w-8 text-center">
                {ev.minute}{ev.extraMinute ? `+${ev.extraMinute}` : ''}'
              </span>
              <EventIcon type={ev.type} />
              <div className={cn('flex flex-col', isHome ? '' : 'items-end')}>
                <span className="font-medium">{ev.player}</span>
                {ev.assist && <span className="text-xs text-muted-foreground">{ev.detail} ({ev.assist})</span>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
