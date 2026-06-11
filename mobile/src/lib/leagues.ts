/** Traducción de nombres de ligas/competiciones al español (donde aplica). */
const LEAGUE_NAMES: Record<string, string> = {
  'World Cup': 'Mundial',
  'Friendlies': 'Amistosos',
  'Friendlies Women': 'Amistosos (Femenino)',
  'UEFA Champions League': 'Liga de Campeones (Champions)',
  'UEFA Europa League': 'Europa League',
  'UEFA Europa Conference League': 'Conference League',
  'UEFA Nations League': 'Liga de Naciones UEFA',
  'Euro Championship': 'Eurocopa',
  'Copa America': 'Copa América',
  'Premier League': 'Premier League (Inglaterra)',
  'La Liga': 'LaLiga (España)',
  'Serie A': 'Serie A (Italia)',
  'Bundesliga': 'Bundesliga (Alemania)',
  'Ligue 1': 'Ligue 1 (Francia)',
  'Primera A': 'Primera A (Colombia)',
  'Primera B': 'Primera B',
  'Major League Soccer': 'MLS (Estados Unidos)',
  'Liga Profesional Argentina': 'Liga Profesional (Argentina)',
  'Serie A Brazil': 'Brasileirão',
  'Eredivisie': 'Eredivisie (Países Bajos)',
  'Primeira Liga': 'Primeira Liga (Portugal)',
  'Copa Libertadores': 'Copa Libertadores',
  'Copa Sudamericana': 'Copa Sudamericana',
  'CONMEBOL Libertadores': 'Copa Libertadores',
  'World Cup - Qualification CONMEBOL': 'Eliminatorias Conmebol',
};

export function translateLeague(name?: string | null): string {
  if (!name) return '';
  return LEAGUE_NAMES[name] ?? name;
}
