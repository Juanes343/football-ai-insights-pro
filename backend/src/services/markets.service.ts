import type { TeamProfile } from './teamStats.service';

export interface Market {
  key: string;
  group: 'Resultado' | 'Goles' | 'Córners' | 'Faltas' | 'Tarjetas' | 'Remates';
  label: string;          // ej. "Doble oportunidad: Brasil o empate"
  probability: number;    // 0-1
  risk: 'Bajo' | 'Medio' | 'Alto';
  odds: number;           // cuota implícita (1/prob)
  explanation: string;
}

export interface MarketsResult {
  analysis: string;
  markets: Market[];
}

// ── Utilidades Poisson ─────────────────────────────────────
function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let f = 1;
  for (let i = 2; i <= k; i++) f *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / f;
}
function poissonCdf(k: number, lambda: number): number {
  let s = 0;
  for (let i = 0; i <= k; i++) s += poisson(i, lambda);
  return s;
}
/** P(total > line) para una línea X.5 con media lambda. */
function overProb(line: number, lambda: number): number {
  return 1 - poissonCdf(Math.floor(line), lambda);
}

function risk(p: number): Market['risk'] {
  if (p >= 0.7) return 'Bajo';
  if (p >= 0.55) return 'Medio';
  return 'Alto';
}
function odds(p: number): number {
  if (p <= 0) return 99;
  return Math.max(1.01, Math.round((1 / p) * 100) / 100);
}
const pctTxt = (p: number) => `${Math.round(p * 100)}%`;

/** Elige una línea X.5 algo por debajo de la media (para un over con sentido). */
function pickLine(mean: number): number {
  return Math.max(0.5, Math.round(mean) - 1.5);
}

interface Params {
  homeName: string;
  awayName: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  homeXg: number;
  awayXg: number;
  home: TeamProfile;
  away: TeamProfile;
}

export function buildMarkets(p: Params): MarketsResult {
  const markets: Market[] = [];
  const totalXg = p.homeXg + p.awayXg;

  // ── Resultado (1X2) ──
  const outcomes = [
    { k: 'home', label: `Gana ${p.homeName}`, prob: p.homeWinProb },
    { k: 'draw', label: 'Empate', prob: p.drawProb },
    { k: 'away', label: `Gana ${p.awayName}`, prob: p.awayWinProb },
  ].sort((a, b) => b.prob - a.prob);
  const top = outcomes[0];
  markets.push({
    key: 'result',
    group: 'Resultado',
    label: top.label,
    probability: top.prob,
    risk: risk(top.prob),
    odds: odds(top.prob),
    explanation: `El modelo ve este desenlace como el más probable (local ${pctTxt(p.homeWinProb)}, empate ${pctTxt(p.drawProb)}, visitante ${pctTxt(p.awayWinProb)}).`,
  });

  // ── Doble oportunidad ──
  const dc = [
    { label: `Doble oportunidad: ${p.homeName} o empate`, prob: p.homeWinProb + p.drawProb },
    { label: `Doble oportunidad: ${p.homeName} o ${p.awayName}`, prob: p.homeWinProb + p.awayWinProb },
    { label: `Doble oportunidad: empate o ${p.awayName}`, prob: p.drawProb + p.awayWinProb },
  ].sort((a, b) => b.prob - a.prob)[0];
  markets.push({
    key: 'double_chance',
    group: 'Resultado',
    label: dc.label,
    probability: dc.prob,
    risk: risk(dc.prob),
    odds: odds(dc.prob),
    explanation: 'Cubre dos de los tres resultados posibles: opción más segura.',
  });

  // ── Goles: over/under 2.5 y 1.5 (elige el lado más probable) ──
  for (const line of [2.5, 1.5]) {
    const over = overProb(line, totalXg);
    const pick = over >= 0.5 ? { label: `Más de ${line} goles`, prob: over } : { label: `Menos de ${line} goles`, prob: 1 - over };
    markets.push({
      key: `goals_${line}`,
      group: 'Goles',
      label: pick.label,
      probability: pick.prob,
      risk: risk(pick.prob),
      odds: odds(pick.prob),
      explanation: `Goles esperados en total: ~${totalXg.toFixed(1)}.`,
    });
  }

  // ── Ambos marcan ──
  const btts = (1 - Math.exp(-p.homeXg)) * (1 - Math.exp(-p.awayXg));
  const bttsPick = btts >= 0.5 ? { label: 'Ambos marcan: Sí', prob: btts } : { label: 'Ambos marcan: No', prob: 1 - btts };
  markets.push({
    key: 'btts',
    group: 'Goles',
    label: bttsPick.label,
    probability: bttsPick.prob,
    risk: risk(bttsPick.prob),
    odds: odds(bttsPick.prob),
    explanation: `Goles esperados: ${p.homeName} ~${p.homeXg.toFixed(1)}, ${p.awayName} ~${p.awayXg.toFixed(1)}.`,
  });

  // ── Córners / Faltas / Tarjetas (media combinada → Poisson) ──
  const addTotalMarket = (
    group: Market['group'],
    metric: string,
    mean: number,
  ) => {
    if (mean <= 0) return;
    const line = pickLine(mean);
    const over = overProb(line, mean);
    const pick = over >= 0.5
      ? { label: `Más de ${line} ${metric}`, prob: over }
      : { label: `Menos de ${line} ${metric}`, prob: 1 - over };
    markets.push({
      key: `${group.toLowerCase()}_${line}`,
      group,
      label: pick.label,
      probability: pick.prob,
      risk: risk(pick.prob),
      odds: odds(pick.prob),
      explanation: `Promedio combinado de ~${mean.toFixed(1)} ${metric} por partido.`,
    });
  };

  addTotalMarket('Córners', 'córners', p.home.corners + p.away.corners);
  addTotalMarket('Faltas', 'faltas', p.home.fouls + p.away.fouls);
  addTotalMarket('Tarjetas', 'tarjetas', p.home.yellow + p.home.red + p.away.yellow + p.away.red);
  addTotalMarket('Remates', 'remates al arco', p.home.shotsOnGoal + p.away.shotsOnGoal);

  // ── Análisis general (texto) ──
  const fav = top.k === 'draw' ? null : top.k === 'home' ? p.homeName : p.awayName;
  const corners = p.home.corners + p.away.corners;
  const fouls = p.home.fouls + p.away.fouls;
  const cards = p.home.yellow + p.home.red + p.away.yellow + p.away.red;
  const analysis =
    (fav
      ? `${fav} es favorito según el modelo (${pctTxt(top.prob)}). `
      : `Partido parejo, con el empate como escenario más probable (${pctTxt(top.prob)}). `) +
    `Se esperan alrededor de ${totalXg.toFixed(1)} goles` +
    (btts >= 0.55 ? ', con buena chance de que ambos marquen' : btts <= 0.4 ? ', con tendencia a que no marquen ambos' : '') +
    `. Ritmo estimado: ~${corners.toFixed(0)} córners, ~${fouls.toFixed(0)} faltas y ~${cards.toFixed(1)} tarjetas en total.`;

  return { analysis, markets };
}
