'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { League, Standing, ApiResponse } from '@/types';
import Image from 'next/image';
import { useState } from 'react';

export function LeaguesBrowser() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);

  const { data: leagues, isLoading } = useQuery<League[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<League[]>>('/leagues');
      return data.data;
    },
    staleTime: 30 * 60_000,
  });

  const { data: standings } = useQuery<Standing[]>({
    queryKey: ['standings', selectedLeagueId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Standing[]>>(`/leagues/${selectedLeagueId}/standings`);
      return data.data;
    },
    enabled: !!selectedLeagueId,
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* League list */}
      <div className="space-y-3">
        <h2 className="font-semibold">Competiciones</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-card border animate-pulse" />
            ))}
          </div>
        ) : (
          leagues?.map((league) => (
            <button
              key={league.id}
              onClick={() => setSelectedLeagueId(league.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                selectedLeagueId === league.id ? 'border-primary bg-primary/10' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {league.logo && <Image src={league.logo} alt={league.name} width={24} height={24} />}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{league.name}</p>
                <p className="text-xs text-muted-foreground">{league.country}</p>
              </div>
              {league.isFeatured && <Badge className="ml-auto text-[10px]">Destacada</Badge>}
            </button>
          ))
        )}
      </div>

      {/* Standings */}
      <div className="lg:col-span-2">
        {selectedLeagueId && standings ? (
          <Card>
            <CardHeader><CardTitle>Tabla de posiciones</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-muted-foreground border-b border-border">
                    <th className="pb-2 text-left w-8">#</th>
                    <th className="pb-2 text-left">Equipo</th>
                    <th className="pb-2 text-center" title="Partidos jugados">PJ</th>
                    <th className="pb-2 text-center" title="Ganados">G</th>
                    <th className="pb-2 text-center" title="Empatados">E</th>
                    <th className="pb-2 text-center" title="Perdidos">P</th>
                    <th className="pb-2 text-center" title="Diferencia de goles">DG</th>
                    <th className="pb-2 text-center font-bold" title="Puntos">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((s) => (
                    <tr key={s.team.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                      <td className="py-2 text-muted-foreground">{s.rank}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          {s.team.logo && <Image src={s.team.logo} alt={s.team.name} width={16} height={16} />}
                          <span className="truncate max-w-[140px]">{s.team.name}</span>
                        </div>
                      </td>
                      <td className="py-2 text-center">{s.played}</td>
                      <td className="py-2 text-center">{s.won}</td>
                      <td className="py-2 text-center">{s.drawn}</td>
                      <td className="py-2 text-center">{s.lost}</td>
                      <td className="py-2 text-center">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                      <td className="py-2 text-center font-bold">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Selecciona una liga para ver la tabla de posiciones
          </div>
        )}
      </div>
    </div>
  );
}
