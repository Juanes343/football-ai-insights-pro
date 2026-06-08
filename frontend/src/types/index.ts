// ─── Enums ───────────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'PREMIUM' | 'ADMIN';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE';
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';
export type PredictionOutcome = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN';
export type NotificationType = 'MATCH_START' | 'GOAL' | 'HALF_TIME' | 'FULL_TIME' | 'PREDICTION_RESULT';

// ─── Auth ────────────────────────────────────────────────────────────────────

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

// ─── League ──────────────────────────────────────────────────────────────────

export interface League {
  id: string;
  externalId: number;
  name: string;
  country: string;
  logo: string | null;
  season: number;
  isFeatured: boolean;
}

// ─── Team ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  externalId: number;
  name: string;
  shortName: string | null;
  logo: string | null;
  country: string | null;
}

// ─── Match ───────────────────────────────────────────────────────────────────

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
  statistics?: MatchStatistic[];
  events?: MatchEvent[];
  lineups?: MatchLineup[];
  prediction?: Prediction | null;
}

export interface MatchStatistic {
  type: string;
  homeValue: string | null;
  awayValue: string | null;
}

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute: number | null;
  type: string;
  detail: string;
  player: string | null;
  assist: string | null;
  teamId: string;
}

export interface MatchLineup {
  teamId: string;
  formation: string | null;
  playerName: string;
  playerNumber: number | null;
  position: string | null;
  isStarting: boolean;
}

// ─── Prediction ──────────────────────────────────────────────────────────────

export interface SecondOpinion {
  provider: string;
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  confidence: number;
  predictedOutcome: PredictionOutcome;
}

// Comparativa entre equipos (de API-Football). Cada valor es tipo "63%".
export interface PredictionComparison {
  form?: { home: string; away: string };
  att?: { home: string; away: string };
  def?: { home: string; away: string };
  poisson_distribution?: { home: string; away: string };
  h2h?: { home: string; away: string };
  goals?: { home: string; away: string };
  total?: { home: string; away: string };
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
  provider?: string;                       // "api" | "model"
  advice?: string | null;                  // consejo en texto
  comparison?: PredictionComparison | null;
  secondOpinion?: SecondOpinion | null;
  createdAt: string;
  match?: Pick<Match, 'id' | 'homeTeam' | 'awayTeam' | 'startTime' | 'status' | 'homeScore' | 'awayScore'>;
}

// ─── Standing ────────────────────────────────────────────────────────────────

export interface Standing {
  rank: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string | null;
}

// ─── Subscription ────────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// ─── API Response shapes ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ─── WebSocket events ─────────────────────────────────────────────────────────

export interface WsMatchUpdate {
  matchId: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
}

export interface WsGoalEvent {
  matchId: string;
  teamId: string;
  player: string;
  minute: number;
  score: { home: number; away: number };
}
