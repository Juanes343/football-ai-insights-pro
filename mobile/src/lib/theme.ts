/** Tema "ProSoccer AI": navy profundo + azul cian eléctrico + dorado. */
export const theme = {
  colors: {
    bg: '#07161f',
    bgElevated: '#0b212c',
    card: '#0e2734',
    cardAlt: '#143240',
    border: '#214252',
    text: '#f3f7ff',
    muted: '#8d9bbd',
    primary: '#22c8f5',      // cian eléctrico (acción principal)
    primaryDim: 'rgba(34,200,245,0.15)',
    gold: '#f3b829',         // dorado (valor / destacado)
    goldDim: 'rgba(243,184,41,0.15)',
    green: '#2fd27a',
    yellow: '#f3b829',
    blue: '#3b82f6',
    red: '#ff5470',
    danger: '#ff5470',
    onPrimary: '#04121c',
  },
  // Degradados (para expo-linear-gradient)
  gradients: {
    brand: ['#22c8f5', '#1f6fe0'] as [string, string],
    gold: ['#f3b829', '#e0892a'] as [string, string],
    card: ['#101a2e', '#0b1322'] as [string, string],
  },
  radius: { sm: 8, md: 12, lg: 16, xl: 22, full: 999 },
  space: (n: number) => n * 4,
};

/** Color según el resultado predicho. */
export function outcomeColor(outcome: string): string {
  switch (outcome) {
    case 'HOME_WIN':
      return theme.colors.green;
    case 'DRAW':
      return theme.colors.gold;
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
