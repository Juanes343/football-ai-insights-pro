from pydantic import BaseModel
from typing import Optional


class PredictionRequest(BaseModel):
    fixtureId: int
    homeTeamId: int
    awayTeamId: int
    leagueId: int
    season: int
    homeLastMatches: list[dict] = []
    awayLastMatches: list[dict] = []
    headToHead: list[dict] = []
    homeTeamStats: Optional[dict] = None
    awayTeamStats: Optional[dict] = None


class PredictionResponse(BaseModel):
    fixtureId: int
    predictedOutcome: str  # HOME_WIN | DRAW | AWAY_WIN
    homeWinProb: float
    drawProb: float
    awayWinProb: float
    confidence: float
    expectedHomeGoals: Optional[float]
    expectedAwayGoals: Optional[float]
    btts: Optional[float]
    over25: Optional[float]
    modelVersion: str
