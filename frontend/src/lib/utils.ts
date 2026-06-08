import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MatchStatus, PredictionOutcome } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...opts,
  }).format(new Date(date));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function getStatusColor(status: MatchStatus) {
  switch (status) {
    case 'LIVE': return 'text-red-400';
    case 'FINISHED': return 'text-muted-foreground';
    case 'SCHEDULED': return 'text-blue-400';
    case 'POSTPONED':
    case 'CANCELLED': return 'text-yellow-400';
    default: return 'text-muted-foreground';
  }
}

export function getStatusLabel(status: MatchStatus) {
  switch (status) {
    case 'LIVE': return 'EN VIVO';
    case 'FINISHED': return 'Final';
    case 'SCHEDULED': return 'Por jugar';
    case 'POSTPONED': return 'Aplazado';
    case 'CANCELLED': return 'Cancelado';
    default: return status;
  }
}

export function getOutcomeLabel(outcome: PredictionOutcome) {
  switch (outcome) {
    case 'HOME_WIN': return 'Gana local';
    case 'DRAW': return 'Empate';
    case 'AWAY_WIN': return 'Gana visitante';
  }
}

export function getOutcomeColor(outcome: PredictionOutcome) {
  switch (outcome) {
    case 'HOME_WIN': return 'text-green-400';
    case 'DRAW': return 'text-yellow-400';
    case 'AWAY_WIN': return 'text-blue-400';
  }
}

/** Probabilidad de Poisson: P(k goles | media λ). */
function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}

export interface Scoreline {
  home: number;
  away: number;
  label: string;   // "2-1"
  prob: number;    // probabilidad 0-1
}

/**
 * Calcula los marcadores exactos más probables a partir de los goles esperados
 * (xG) de cada equipo, asumiendo dos Poisson independientes.
 * Ideal para "pollas" donde se predice el resultado exacto.
 */
export function topScorelines(homeXg: number, awayXg: number, n = 3, maxGoals = 6): Scoreline[] {
  const list: Scoreline[] = [];
  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      list.push({ home: i, away: j, label: `${i}-${j}`, prob: poisson(i, homeXg) * poisson(j, awayXg) });
    }
  }
  return list.sort((a, b) => b.prob - a.prob).slice(0, n);
}

/** Traduce el consejo de API-Football (viene en inglés) al español. */
export function translateAdvice(advice: string): string {
  if (!advice) return advice;
  let t = advice;
  t = t.replace(/Combo Double chance/gi, 'Combo doble oportunidad');
  t = t.replace(/Double chance/gi, 'Doble oportunidad');
  t = t.replace(/Winner/gi, 'Ganador');
  t = t.replace(/No predictions available/gi, 'Sin predicción disponible');
  // Goles: "+1.5 goals" / "-2.5 goals"
  t = t.replace(/\+\s*(\d+(?:\.\d+)?)\s*goals?/gi, 'más de $1 goles');
  t = t.replace(/-\s*(\d+(?:\.\d+)?)\s*goals?/gi, 'menos de $1 goles');
  // Conectores (orden importa)
  t = t.replace(/\bor draw\b/gi, 'o empate');
  t = t.replace(/\bdraw\b/gi, 'empate');
  t = t.replace(/\band\b/gi, 'y');
  t = t.replace(/\bor\b/gi, 'o');
  return t;
}

export function getConfidenceBadge(confidence: number): { label: string; className: string } {
  if (confidence >= 0.8) return { label: 'Alta', className: 'bg-green-500/20 text-green-400' };
  if (confidence >= 0.6) return { label: 'Media', className: 'bg-yellow-500/20 text-yellow-400' };
  return { label: 'Baja', className: 'bg-red-500/20 text-red-400' };
}
