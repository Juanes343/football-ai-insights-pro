from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.schemas import PredictionRequest, PredictionResponse
from app.models.predictor import predictor
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        result = predictor.predict(request)
        return result
    except Exception as e:
        logger.error("Prediction error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/train")
async def train(background_tasks: BackgroundTasks, data: list[dict]):
    background_tasks.add_task(_do_train, data)
    return {"message": "Training started in background"}


def _do_train(data: list[dict]):
    result = predictor.retrain(data)
    logger.info("Training result: %s", result)


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": predictor.model is not None,
        "model_version": "1.0.0",
    }
