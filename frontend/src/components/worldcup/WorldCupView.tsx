'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn, topScorelines } from '@/lib/utils';
import type { Match, ApiResponse } from '@/types';

interface GroupRow {
  team: { id: string; name: string; logo: string | null };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

interface WorldCupGroup {
  name: string;
  matches: Match[];
  table: GroupRow[];
}

const OUTCOME_BADGE: Record<string, { txt: string; cls: string }> = {
  HOME_WIN: { txt: 'Gana local', cls: 'text-green-400' },
  DRAW: { txt: 'Empate', cls: 'text-yellow-400' },
  AWAY_WIN: { txt: 'Gana visitante', cls: 'text-blue-400' },
};

export function WorldCupView() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useQuery<WorldCupGroup[]>({
    queryKey: ['worldcup'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ groups: WorldCupGroup[] }>>('/predictions/worldcup');
      return data.data.groups;
    },
    staleTime: 10 * 60_000,
  });

  // Filtrar grupos por selección o nombre de grupo
  const groups = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((g) => {
      if (g.name.toLowerCase().includes(q)) return true;
      if (g.table.some((r) => r.team.name.toLowerCase().includes(q))) return true;
      return g.matches.some(
        (m) => m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q),
      );
    });
  }, [data, query]);

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-80 rounded-xl bg-card border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-16">No hay datos del Mundial disponibles.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Buscador de selecciones / grupos */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar selección o grupo… (ej: Colombia)"
          className="pl-9 pr-9"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-muted-foreground py-16">No se encontró ninguna selección o grupo con “{query}”.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((group) => (
        <Card key={group.name}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              🏆 {group.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tabla proyectada */}
            <div>
              <div className="grid grid-cols-[1.5rem_1fr_2rem_2rem] gap-1 text-[10px] text-muted-foreground px-1 mb-1">
                <span>#</span>
                <span>Selección</span>
                <span className="text-center">PJ</span>
                <span className="text-center font-bold">Pts</span>
              </div>
              {group.table.map((row, i) => (
                <div
                  key={row.team.id}
                  className={cn(
                    'grid grid-cols-[1.5rem_1fr_2rem_2rem] gap-1 items-center px-1 py-1 rounded text-sm',
                    i < 2 ? 'bg-primary/10' : '',
                  )}
                  title={i < 2 ? 'Clasifica (proyección)' : ''}
                >
                  <span className="text-xs text-muted-foreground">{i + 1}</span>
                  <span className="flex items-center gap-2 min-w-0">
                    {row.team.logo && <Image src={row.team.logo} alt={row.team.name} width={18} height={18} />}
                    <span className="truncate">{row.team.name}</span>
                  </span>
                  <span className="text-center text-xs">{row.played}</span>
                  <span className="text-center font-bold">{row.points}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground mt-1">Tabla proyectada según las predicciones (los 2 primeros clasifican)</p>
            </div>

            {/* Partidos del grupo */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <p className="text-[11px] text-muted-foreground">Partidos</p>
              {group.matches.map((m) => {
                const pred = m.prediction;
                const badge = pred ? OUTCOME_BADGE[pred.predictedOutcome] : null;
                return (
                  <Link
                    key={m.id}
                    href={`/matches/${m.externalId}`}
                    className="block rounded-lg hover:bg-accent/40 transition-colors px-2 py-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-1.5 flex-1 min-w-0 justify-end text-right">
                        <span className="truncate">{m.homeTeam.name}</span>
                        {m.homeTeam.logo && <Image src={m.homeTeam.logo} alt="" width={16} height={16} />}
                      </span>
                      <span className="text-[10px] font-bold text-foreground tabular-nums px-1" title="Marcador más probable">
                        {pred && pred.expectedHomeGoals != null && pred.expectedAwayGoals != null
                          ? topScorelines(pred.expectedHomeGoals, pred.expectedAwayGoals, 1)[0]?.label ?? 'vs'
                          : 'vs'}
                      </span>
                      <span className="flex items-center gap-1.5 flex-1 min-w-0">
                        {m.awayTeam.logo && <Image src={m.awayTeam.logo} alt="" width={16} height={16} />}
                        <span className="truncate">{m.awayTeam.name}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {m.startTime ? format(new Date(m.startTime), "d MMM", { locale: es }) : ''}
                      </span>
                      {badge && pred && (
                        <span className={cn('text-[10px] font-medium', badge.cls)}>
                          {badge.txt} · {Math.round(Math.max(pred.homeWinProb, pred.drawProb, pred.awayWinProb) * 100)}%
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
          ))}
        </div>
      )}
    </div>
  );
}
