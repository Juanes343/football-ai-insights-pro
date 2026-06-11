/** Tema "ProSoccer AI": negro tecnológico + azul IA/neural + dorado premium. */
export const theme = {
  colors: {
    bg: '#05070D',            // negro tecnológico
    bgElevated: '#0A1F44',    // azul profundo
    card: 'rgba(10,31,68,0.65)',   // glassmorphism
    cardAlt: 'rgba(10,31,68,0.45)',
    border: 'rgba(0,229,255,0.22)', // borde iluminado cian
    text: '#FFFFFF',
    muted: '#9fb2cc',         // gris metálico suave
    primary: '#00B8FF',       // azul IA
    primaryDim: 'rgba(0,184,255,0.16)',
    neural: '#00E5FF',        // azul neural
    gold: '#FFD54A',          // dorado premium
    goldDark: '#C89B2B',
    goldDim: 'rgba(255,213,74,0.16)',
    green: '#2fe39a',
    yellow: '#FFD54A',
    blue: '#00B8FF',
    red: '#ff5470',
    danger: '#ff5470',
    onPrimary: '#04121f',
    metal: '#D9E3EA',
  },
  // Degradados (para expo-linear-gradient)
  gradients: {
    brand: ['#00B8FF', '#00E5FF'] as [string, string],
    gold: ['#C89B2B', '#FFD54A'] as [string, string],
    card: ['#0A1F44', '#05070D'] as [string, string],
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
