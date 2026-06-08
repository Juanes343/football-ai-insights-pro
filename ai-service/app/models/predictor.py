import os
import json
import math
import logging
import numpy as np
from typing import Optional
import joblib
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
from app.core.config import settings

logger = logging.getLogger(__name__)

MODEL_VERSION = "3.0.0"

# Ruta del archivo de ratings Elo (generado por train_model.py).
ELO_PATH = os.path.join(os.path.dirname(settings.model_path) or ".", "elo_ratings.json")
DEFAULT_ELO = 1500.0


def _form_score(matches: list[dict], team_id: int) -> float:
    """Convert last 5 results to a form score (0-1)."""
    points = []
    for m in matches[-5:]:
        home = m.get("homeTeamId") == team_id
        hg = m.get("homeScore", 0) or 0
        ag = m.get("awayScore", 0) or 0
        if home:
            points.append(3 if hg > ag else (1 if hg == ag else 0))
        else:
            points.append(3 if ag > hg else (1 if hg == ag else 0))
    return sum(points) / (len(points) * 3) if points else 0.5


def _avg_goals(matches: list[dict], team_id: int, scored: bool = True) -> float:
    values = []
    for m in matches:
        home = m.get("homeTeamId") == team_id
        if scored:
            values.append((m.get("homeScore") or 0) if home else (m.get("awayScore") or 0))
        else:
            values.append((m.get("awayScore") or 0) if home else (m.get("homeScore") or 0))
    return float(np.mean(values)) if values else 1.2


def _h2h_advantage(h2h: list[dict], home_id: int) -> float:
    wins = draws = losses = 0
    for m in h2h[-10:]:
        home = m.get("homeTeamId") == home_id
        hg = m.get("homeScore", 0) or 0
        ag = m.get("awayScore", 0) or 0
        if hg == ag:
            draws += 1
        elif (home and hg > ag) or (not home and ag > hg):
            wins += 1
        else:
            losses += 1
    total = wins + draws + losses or 1
    return wins / total


def build_features(request, home_elo: float = DEFAULT_ELO, away_elo: float = DEFAULT_ELO) -> np.ndarray:
    home_id = request.homeTeamId
    away_id = request.awayTeamId
    home = request.homeLastMatches
    away = request.awayLastMatches
    h2h = request.headToHead

    home_form = _form_score(home, home_id)
    away_form = _form_score(away, away_id)
    home_scored = _avg_goals(home, home_id, scored=True)
    home_conceded = _avg_goals(home, home_id, scored=False)
    away_scored = _avg_goals(away, away_id, scored=True)
    away_conceded = _avg_goals(away, away_id, scored=False)
    h2h_adv = _h2h_advantage(h2h, home_id)

    # Simple attack/defence rating (0-1 scale)
    attack_diff = min(1.0, (home_scored - away_conceded) / 3)
    defence_diff = min(1.0, (away_scored - home_conceded) / 3)

    # Rating Elo (nivel histórico del equipo), normalizado.
    home_elo_n = (home_elo - DEFAULT_ELO) / 400.0
    away_elo_n = (away_elo - DEFAULT_ELO) / 400.0
    elo_diff = (home_elo - away_elo) / 400.0

    return np.array([[
        home_form,
        away_form,
        home_scored,
        home_conceded,
        away_scored,
        away_conceded,
        h2h_adv,
        attack_diff,
        defence_diff,
        len(home),
        len(away),
        home_elo_n,
        away_elo_n,
        elo_diff,
    ]])


class FootballPredictor:
    def __init__(self):
        self.model: Optional[XGBClassifier] = None
        self.elo: dict = {}
        self._elo_mtime: float = 0.0
        self._load_model()
        self._load_elo()

    def _load_model(self):
        path = settings.model_path
        if os.path.exists(path):
            try:
                self.model = joblib.load(path)
                logger.info("XGBoost model loaded from %s", path)
            except Exception as e:
                logger.warning("Failed to load model: %s", e)

    def _load_elo(self):
        """Carga (o recarga si cambió) los ratings Elo desde disco."""
        try:
            if os.path.exists(ELO_PATH):
                mtime = os.path.getmtime(ELO_PATH)
                if mtime != self._elo_mtime:
                    with open(ELO_PATH, "r", encoding="utf-8") as f:
                        self.elo = json.load(f)
                    self._elo_mtime = mtime
                    logger.info("Elo ratings cargados (%d equipos)", len(self.elo))
        except Exception as e:
            logger.warning("Failed to load Elo ratings: %s", e)

    def _team_elo(self, team_id) -> float:
        self._load_elo()
        return float(self.elo.get(str(team_id), DEFAULT_ELO))

    def predict(self, request) -> dict:
        home_elo = self._team_elo(request.homeTeamId)
        away_elo = self._team_elo(request.awayTeamId)

        # Goles esperados (forma + Elo) → de aquí sale TODO de forma coherente
        home_xg, away_xg = self._expected_goals(request, home_elo, away_elo)

        # Distribución de marcadores con dos Poisson independientes
        max_goals = 8
        ph = [math.exp(-home_xg) * home_xg ** i / math.factorial(i) for i in range(max_goals + 1)]
        pa = [math.exp(-away_xg) * away_xg ** j / math.factorial(j) for j in range(max_goals + 1)]

        home_win = draw = away_win = btts = over25 = 0.0
        best_i, best_j, best_p = 0, 0, -1.0
        for i in range(max_goals + 1):
            for j in range(max_goals + 1):
                p = ph[i] * pa[j]
                if i > j:
                    home_win += p
                elif i == j:
                    draw += p
                else:
                    away_win += p
                if i > 0 and j > 0:
                    btts += p
                if i + j >= 3:
                    over25 += p
                if p > best_p:
                    best_i, best_j, best_p = i, j, p

        total = (home_win + draw + away_win) or 1.0
        home_p, draw_p, away_p = home_win / total, draw / total, away_win / total
        probs = [home_p, draw_p, away_p]
        outcome = ["HOME_WIN", "DRAW", "AWAY_WIN"][int(np.argmax(probs))]
        confidence = float(max(probs))

        return {
            "fixtureId": request.fixtureId,
            "predictedOutcome": outcome,
            "homeWinProb": round(home_p, 4),
            "drawProb": round(draw_p, 4),
            "awayWinProb": round(away_p, 4),
            "confidence": round(confidence, 4),
            "expectedHomeGoals": round(home_xg, 2),
            "expectedAwayGoals": round(away_xg, 2),
            "mostLikelyScore": f"{best_i}-{best_j}",
            "btts": round(btts, 4),
            "over25": round(over25, 4),
            "modelVersion": MODEL_VERSION,
        }

    def _expected_goals(self, request, home_elo: float = DEFAULT_ELO, away_elo: float = DEFAULT_ELO) -> tuple[float, float]:
        home_id = request.homeTeamId
        away_id = request.awayTeamId
        home_attack = _avg_goals(request.homeLastMatches, home_id, scored=True)
        home_defence = _avg_goals(request.homeLastMatches, home_id, scored=False)
        away_attack = _avg_goals(request.awayLastMatches, away_id, scored=True)
        away_defence = _avg_goals(request.awayLastMatches, away_id, scored=False)
        league_avg = 1.3

        # 1) Goles esperados por forma reciente
        home_xg_form = max(0.2, home_attack * (away_defence / league_avg) * 1.1)  # ventaja local
        away_xg_form = max(0.2, away_attack * (home_defence / league_avg))

        # 2) Goles esperados por Elo (supremacía del equipo más fuerte)
        HOME_ADV = 65.0
        ELO_PER_GOAL = 130.0
        total_form = home_xg_form + away_xg_form
        total = total_form if total_form >= 1.6 else 1.6  # piso razonable de goles totales
        sup = (home_elo + HOME_ADV - away_elo) / ELO_PER_GOAL  # supremacía en goles
        home_xg_elo = max(0.15, total / 2 + sup / 2)
        away_xg_elo = max(0.15, total / 2 - sup / 2)

        # 3) Mezcla 50/50 forma + Elo
        home_xg = 0.5 * home_xg_form + 0.5 * home_xg_elo
        away_xg = 0.5 * away_xg_form + 0.5 * away_xg_elo
        return home_xg, away_xg

    def retrain(self, training_data: list[dict]) -> dict:
        """Train XGBoost on historical match data."""
        if len(training_data) < settings.min_matches_for_training:
            return {"success": False, "reason": "insufficient data"}

        X, y = [], []
        label_map = {"HOME_WIN": 0, "DRAW": 1, "AWAY_WIN": 2}
        for row in training_data:
            if row.get("outcome") not in label_map:
                continue
            X.append(row["features"])
            y.append(label_map[row["outcome"]])

        if len(X) < settings.min_matches_for_training:
            return {"success": False, "reason": "insufficient labelled data"}

        model = XGBClassifier(n_estimators=200, max_depth=5, learning_rate=0.05,
                              eval_metric="mlogloss",
                              num_class=3, objective="multi:softprob")
        model.fit(np.array(X), np.array(y))
        os.makedirs(os.path.dirname(settings.model_path), exist_ok=True)
        joblib.dump(model, settings.model_path)
        self.model = model
        logger.info("Model retrained on %d samples", len(X))
        return {"success": True, "samples": len(X)}


predictor = FootballPredictor()
