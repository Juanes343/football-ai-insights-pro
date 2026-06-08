'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { MatchStatistic } from '@/types';

interface Props {
  statistics: MatchStatistic[];
  homeTeam: string;
  awayTeam: string;
}

// Traducción de los nombres de estadística que entrega la API (en inglés).
const STAT_LABELS: Record<string, string> = {
  'Shots on Goal': 'Remates al arco',
  'Shots off Goal': 'Remates por fuera',
  'Total Shots': 'Remates totales',
  'Blocked Shots': 'Remates bloqueados',
  'Shots insidebox': 'Remates dentro del área',
  'Shots outsidebox': 'Remates fuera del área',
  'Fouls': 'Faltas',
  'Corner Kicks': 'Tiros de esquina',
  'Offsides': 'Fueras de lugar',
  'Ball Possession': 'Posesión del balón',
  'Yellow Cards': 'Tarjetas amarillas',
  'Red Cards': 'Tarjetas rojas',
  'Goalkeeper Saves': 'Atajadas',
  'Total passes': 'Pases totales',
  'Passes accurate': 'Pases acertados',
  'Passes %': '% de pases',
  'expected_goals': 'Goles esperados (xG)',
};

function statLabel(type: string): string {
  return STAT_LABELS[type] ?? type;
}

export function MatchStatisticsView({ statistics, homeTeam, awayTeam }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Estadísticas del partido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 text-xs text-muted-foreground text-center mb-2">
          <span className="truncate text-left">{homeTeam}</span>
          <span></span>
          <span className="truncate text-right">{awayTeam}</span>
        </div>
        {statistics.map((stat) => {
          const home = parseFloat(stat.homeValue ?? '0') || 0;
          const away = parseFloat(stat.awayValue ?? '0') || 0;
          const total = home + away || 1;
          return (
            <div key={stat.type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium tabular-nums">{stat.homeValue ?? '–'}</span>
                <span className="text-xs text-muted-foreground">{statLabel(stat.type)}</span>
                <span className="font-medium tabular-nums">{stat.awayValue ?? '–'}</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="flex-1 flex justify-end">
                  <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${(home / total) * 100}%` }} />
                </div>
                <div className="w-px h-3 bg-border" />
                <div className="flex-1">
                  <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${(away / total) * 100}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
