'use client';

import { useState, useMemo } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiveMatchCard } from './LiveMatchCard';
import { useLiveMatches, useMatchesByDate } from '@/hooks/useMatches';
import type { Match } from '@/types';

type StatusFilter = 'all' | 'upcoming' | 'live' | 'finished';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'upcoming', label: 'Por jugar' },
  { value: 'live', label: 'En vivo' },
  { value: 'finished', label: 'Finalizados' },
];

function matchesQuery(m: Match, q: string): boolean {
  if (!q) return true;
  const t = q.toLowerCase();
  return (
    m.homeTeam.name.toLowerCase().includes(t) ||
    m.awayTeam.name.toLowerCase().includes(t) ||
    m.league.name.toLowerCase().includes(t)
  );
}

function matchesStatus(m: Match, f: StatusFilter): boolean {
  if (f === 'all') return true;
  if (f === 'upcoming') return m.status === 'SCHEDULED';
  if (f === 'live') return m.status === 'LIVE';
  if (f === 'finished') return m.status === 'FINISHED';
  return true;
}

export function MatchesCenter() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const { data: liveMatches } = useLiveMatches();
  const { data: matches, isLoading } = useMatchesByDate(selectedDate);

  // Partidos del día filtrados (búsqueda + estado), ordenados por hora de inicio
  const dayMatches = useMemo(() => {
    const list = (matches ?? [])
      .filter((m) => matchesQuery(m, query) && matchesStatus(m, statusFilter))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return list;
  }, [matches, query, statusFilter]);

  const upcoming = dayMatches.filter((m) => m.status === 'SCHEDULED');
  const others = dayMatches.filter((m) => m.status !== 'SCHEDULED');

  const liveFiltered = (liveMatches ?? []).filter((m) => matchesQuery(m, query));

  return (
    <div className="space-y-6">
      {/* Buscador + filtro por estado */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar equipo o liga…"
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
        <div className="flex gap-1">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Live section (solo si no se filtra por otro estado) */}
      {(statusFilter === 'all' || statusFilter === 'live') && liveFiltered.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="live-dot" />
            <h2 className="font-semibold text-red-400">EN VIVO AHORA</h2>
            <span className="text-sm text-muted-foreground">({liveFiltered.length} partidos)</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveFiltered.map((m) => <LiveMatchCard key={m.id} match={m} showPrediction />)}
          </div>
        </div>
      )}

      {/* Date picker */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => subDays(d, 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium min-w-[120px] text-center capitalize">
          {isToday ? 'Hoy' : format(selectedDate, "EEE d 'de' MMM", { locale: es })}
        </span>
        <Button variant="outline" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        {!isToday && (
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>Hoy</Button>
        )}
      </div>

      {/* Matches list */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : dayMatches.length > 0 ? (
        <div className="space-y-6">
          {/* Próximos / por jugar */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                ⏳ Próximos {isToday ? 'de hoy' : ''} ({upcoming.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcoming.map((m) => <LiveMatchCard key={m.id} match={m} showPrediction />)}
              </div>
            </div>
          )}
          {/* En juego / finalizados de la fecha */}
          {others.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                {upcoming.length > 0 ? 'En juego / finalizados' : 'Partidos'} ({others.length})
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map((m) => <LiveMatchCard key={m.id} match={m} showPrediction />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-16">
          {query || statusFilter !== 'all'
            ? 'No hay partidos que coincidan con el filtro.'
            : 'No se encontraron partidos para esta fecha.'}
        </p>
      )}
    </div>
  );
}
