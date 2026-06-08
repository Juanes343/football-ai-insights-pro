from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@localhost:5432/football_ai_db"
    redis_url: str = ""
    backend_url: str = "http://localhost:4000"
    model_path: str = "models_saved/xgb_model.joblib"
    min_matches_for_training: int = 20

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
