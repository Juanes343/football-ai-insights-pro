function poisson(k: number, lambda: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}

export interface Scoreline {
  label: string;
  prob: number;
}

/** Marcadores exactos más probables a partir de los goles esperados (Poisson). */
export function topScorelines(homeXg: number, awayXg: number, n = 3, maxGoals = 6): Scoreline[] {
  const list: Scoreline[] = [];
  for (let i = 0; i <= maxGoals; i++) {
    for (let j = 0; j <= maxGoals; j++) {
      list.push({ label: `${i}-${j}`, prob: poisson(i, homeXg) * poisson(j, awayXg) });
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
  t = t.replace(/\+\s*(\d+(?:\.\d+)?)\s*goals?/gi, 'más de $1 goles');
  t = t.replace(/-\s*(\d+(?:\.\d+)?)\s*goals?/gi, 'menos de $1 goles');
  t = t.replace(/\bor draw\b/gi, 'o empate');
  t = t.replace(/\bdraw\b/gi, 'empate');
  t = t.replace(/\band\b/gi, 'y');
  t = t.replace(/\bor\b/gi, 'o');
  return t;
}
