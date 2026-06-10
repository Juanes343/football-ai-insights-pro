// Tipos compartidos con la API (mismos que el frontend web).

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type PredictionOutcome = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface League {
  id: string;
  externalId: number;
  name: string;
  country: string;
  logo: string | null;
  season: number;
  isFeatured?: boolean;
}

export interface Team {
  id: string;
  externalId: number;
  name: string;
  shortName: string | null;
  logo: string | null;
  country: string | null;
}

export interface Match {
  id: string;
  externalId: number;
  status: MatchStatus;
  minute: number | null;
  startTime: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  homeScore: number | null;
  awayScore: number | null;
  htHomeScore: number | null;
  htAwayScore: number | null;
  venue: string | null;
  referee: string | null;
  prediction?: Prediction | null;
}

export interface SecondOpinion {
  provider: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: number;
  predictedOutcome: PredictionOutcome;
}

export interface PredictionComparison {
  form?: { home: string; away: string };
  att?: { home: string; away: string };
  def?: { home: string; away: string };
  poisson_distribution?: { home: string; away: string };
  h2h?: { home: string; away: string };
  goals?: { home: string; away: string };
  total?: { home: string; away: string };
}

export type MarketGroup = 'Resultado' | 'Goles' | 'Córners' | 'Faltas' | 'Tarjetas' | 'Remates';

export interface Market {
  key: string;
  group: MarketGroup;
  label: string;
  probability: number;
  risk: 'Bajo' | 'Medio' | 'Alto';
  odds: number;
  explanation: string;
}

export interface Prediction {
  id: string;
  matchId: string;
  predictedOutcome: PredictionOutcome;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: number;
  expectedHomeGoals: number | null;
  expectedAwayGoals: number | null;
  btts: number | null;
  over25: number | null;
  modelVersion: string | null;
  provider?: string;
  advice?: string | null;
  comparison?: PredictionComparison | null;
  secondOpinion?: SecondOpinion | null;
  analysis?: string | null;
  markets?: Market[];
  createdAt: string;
  match?: Pick<Match, 'id' | 'externalId' | 'homeTeam' | 'awayTeam' | 'startTime' | 'status' | 'homeScore' | 'awayScore'>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Mundial
export interface GroupRow {
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

export interface WorldCupGroup {
  name: string;
  matches: Match[];
  table: GroupRow[];
}
