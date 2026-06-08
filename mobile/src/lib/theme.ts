/** Tema oscuro de la app (coherente con la versión web). */
export const theme = {
  colors: {
    bg: '#0a0b0d',
    card: '#16181d',
    cardAlt: '#1d2026',
    border: '#262a31',
    text: '#f5f6f7',
    muted: '#9aa0a6',
    primary: '#22c55e',
    primaryDim: 'rgba(34,197,94,0.15)',
    green: '#22c55e',
    yellow: '#eab308',
    blue: '#3b82f6',
    red: '#ef4444',
    danger: '#ef4444',
  },
  radius: { sm: 8, md: 12, lg: 16, full: 999 },
  space: (n: number) => n * 4,
};

/** Color según el resultado predicho. */
export function outcomeColor(outcome: string): string {
  switch (outcome) {
    case 'HOME_WIN':
      return theme.colors.green;
    case 'DRAW':
      return theme.colors.yellow;
    case 'AWAY_WIN':
      return theme.colors.blue;
    default:
      return theme.colors.muted;
  }
}

export function outcomeLabel(outcome: string): string {
  switch (outcome) {
    case 'HOME_WIN':
      return 'Gana local';
    case 'DRAW':
      return 'Empate';
    case 'AWAY_WIN':
      return 'Gana visitante';
    default:
      return outcome;
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'LIVE':
      return 'EN VIVO';
    case 'FINISHED':
      return 'Final';
    case 'SCHEDULED':
      return 'Por jugar';
    case 'POSTPONED':
      return 'Aplazado';
    case 'CANCELLED':
      return 'Cancelado';
    default:
      return status;
  }
}

export function pct(v?: number | null): string {
  return v != null ? `${Math.round(v * 100)}%` : '—';
}
