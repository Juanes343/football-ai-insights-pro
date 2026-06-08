"""
Entrena el modelo XGBoost con histórico real de API-Football.

- Descarga las temporadas indicadas (1 llamada por liga-temporada).
- Construye el dataset de forma cronológica y "point-in-time":
  para cada partido, las features se calculan SOLO con la información
  previa a ese partido (sin filtrar datos del futuro).
- Reutiliza la misma función build_features del modelo, para que las
  features de entrenamiento coincidan exactamente con las de predicción.
- Envía el dataset al servicio en ejecución (POST /api/train), que
  entrena en segundo plano, actualiza el modelo en memoria y lo guarda.

Uso:
    .venv/Scripts/python.exe train_model.py
"""
import os
import sys
import json
import time
import logging
from types import SimpleNamespace
from collections import defaultdict

import httpx
from dotenv import load_dotenv

load_dotenv()

from app.models.predictor import build_features  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(message)s")
log = logging.getLogger("train")

API_KEY = os.getenv("API_FOOTBALL_KEY", "")
API_BASE = os.getenv("API_FOOTBALL_BASE", "https://v3.football.api-sports.io")
SERVICE_URL = os.getenv("AI_SELF_URL", "http://localhost:8000")

# Competencias a usar para entrenar. Cada (liga, temporada) = 1 llamada API.
# Mezclamos CLUBES (forma general) + SELECCIONES (para el Mundial) en un
# único modelo combinado que sirve para ambos tipos de partido.
COMPETITIONS = [
    # ── Clubes ──
    ("Premier League (Inglaterra)", 39, 2022),
    ("Premier League (Inglaterra)", 39, 2023),
    ("La Liga (España)", 140, 2022),
    ("La Liga (España)", 140, 2023),
    ("Serie A (Italia)", 135, 2022),
    ("Serie A (Italia)", 135, 2023),
    ("Bundesliga (Alemania)", 78, 2022),
    ("Bundesliga (Alemania)", 78, 2023),
    ("Ligue 1 (Francia)", 61, 2022),
    ("Ligue 1 (Francia)", 61, 2023),
    ("Primera A (Colombia)", 239, 2022),
    ("Primera A (Colombia)", 239, 2023),
    # ── Selecciones (para el Mundial) ──
    ("Mundial", 1, 2018),
    ("Mundial", 1, 2022),
    ("Copa América", 9, 2021),
    ("Copa América", 9, 2024),
    ("Eurocopa", 4, 2020),
    ("Eurocopa", 4, 2024),
    ("UEFA Nations League", 5, 2022),
    ("UEFA Nations League", 5, 2024),
    ("Amistosos selecciones", 10, 2024),
    ("Amistosos selecciones", 10, 2025),
]

FINISHED = {"FT", "AET", "PEN"}
HEADERS = {"x-rapidapi-key": API_KEY, "x-rapidapi-host": "v3.football.api-sports.io"}


def fetch_fixtures(league: int, season: int) -> list:
    try:
        r = httpx.get(
            f"{API_BASE}/fixtures",
            params={"league": league, "season": season},
            headers=HEADERS,
            timeout=40,
        )
        data = r.json()
        if data.get("errors"):
            log.warning("  API errors liga %s temporada %s: %s", league, season, data["errors"])
        return data.get("response", [])
    except Exception as e:  # noqa: BLE001
        log.warning("  Error al descargar liga %s temporada %s: %s", league, season, e)
        return []


def main() -> int:
    if not API_KEY:
        log.error("Falta API_FOOTBALL_KEY en el entorno (.env).")
        return 1

    # 1) Descargar todos los partidos
    all_fixtures = []
    for name, league, season in COMPETITIONS:
        fx = fetch_fixtures(league, season)
        log.info("Descargado: %s %s → %d partidos", name, season, len(fx))
        all_fixtures.extend(fx)
        time.sleep(0.5)  # respetar límite de la API

    # 2) Quedarnos con los finalizados y ordenarlos cronológicamente
    finished = [
        f for f in all_fixtures
        if f.get("fixture", {}).get("status", {}).get("short") in FINISHED
        and f.get("goals", {}).get("home") is not None
        and f.get("goals", {}).get("away") is not None
    ]
    finished.sort(key=lambda f: f["fixture"]["date"])
    log.info("Partidos finalizados con resultado: %d", len(finished))

    # 3) Construir dataset point-in-time (incluye rating Elo)
    history: dict = defaultdict(list)       # teamId -> partidos previos
    h2h_history: dict = defaultdict(list)   # (idA,idB) ordenado -> enfrentamientos previos
    elo: dict = defaultdict(lambda: 1500.0)  # teamId -> rating Elo
    training = []

    HOME_ADV = 65      # ventaja de local en el cálculo Elo
    K = 30             # factor K de actualización

    def expected(ra: float, rb: float) -> float:
        return 1.0 / (1.0 + 10 ** ((rb - ra) / 400.0))

    for f in finished:
        home = f["teams"]["home"]["id"]
        away = f["teams"]["away"]["id"]
        hg = f["goals"]["home"]
        ag = f["goals"]["away"]

        home_last = history[home][-10:]
        away_last = history[away][-10:]
        key = tuple(sorted([home, away]))
        h2h = h2h_history[key][-10:]

        # Elo ANTES del partido (point-in-time)
        he = elo[home]
        ae = elo[away]

        # Solo entrenar cuando ambos equipos tienen algo de historial
        if len(home_last) >= 3 and len(away_last) >= 3:
            req = SimpleNamespace(
                homeTeamId=home,
                awayTeamId=away,
                homeLastMatches=home_last,
                awayLastMatches=away_last,
                headToHead=h2h,
            )
            feats = build_features(req, he, ae)[0].tolist()
            if hg > ag:
                outcome = "HOME_WIN"
            elif hg == ag:
                outcome = "DRAW"
            else:
                outcome = "AWAY_WIN"
            training.append({"features": feats, "outcome": outcome})

        # Actualizar Elo según el resultado (con factor por diferencia de goles)
        ea = expected(he + HOME_ADV, ae)
        sa = 1.0 if hg > ag else (0.5 if hg == ag else 0.0)
        gd = abs(hg - ag)
        mult = 1.0 if gd <= 1 else (1.5 if gd == 2 else (1.75 if gd == 3 else 1.75 + (gd - 3) / 8))
        delta = K * mult * (sa - ea)
        elo[home] = he + delta
        elo[away] = ae - delta

        # Actualizar historial DESPUÉS de usarlo (point-in-time)
        match_dict = {"homeTeamId": home, "awayTeamId": away, "homeScore": hg, "awayScore": ag}
        history[home].append(match_dict)
        history[away].append(match_dict)
        h2h_history[key].append(match_dict)

    log.info("Muestras de entrenamiento generadas: %d", len(training))

    # Guardar ratings Elo para que el predictor los use (misma carpeta del modelo)
    model_path = os.getenv("MODEL_PATH", "models_saved/xgb_model.joblib")
    elo_path = os.path.join(os.path.dirname(model_path) or ".", "elo_ratings.json")
    os.makedirs(os.path.dirname(elo_path) or ".", exist_ok=True)
    with open(elo_path, "w", encoding="utf-8") as fp:
        json.dump({str(k): round(v, 1) for k, v in elo.items()}, fp)
    log.info("Elo guardado: %d equipos → %s", len(elo), elo_path)

    # Top 10 selecciones/equipos por Elo (chequeo rápido)
    top = sorted(elo.items(), key=lambda kv: kv[1], reverse=True)[:10]
    log.info("Top Elo (ids): %s", [(k, round(v)) for k, v in top])

    # Distribución de resultados (para verificar que no sea trivial)
    dist = defaultdict(int)
    for t in training:
        dist[t["outcome"]] += 1
    log.info("Distribución: %s", dict(dist))

    if len(training) < 50:
        log.error("Muy pocas muestras (%d). Revisa el acceso a la API.", len(training))
        return 1

    # 4) Enviar al servicio para entrenar
    log.info("Enviando dataset a %s/api/train ...", SERVICE_URL)
    r = httpx.post(f"{SERVICE_URL}/api/train", json=training, timeout=120)
    log.info("Respuesta del servicio: %s %s", r.status_code, r.text)
    return 0


if __name__ == "__main__":
    sys.exit(main())
