import os
from pydantic import BaseModel

class Settings(BaseModel):
    PORT: int = int(os.getenv("PORT", "8001"))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CINEMA_CORE_URL: str = os.getenv("CINEMA_CORE_URL", "http://localhost:3002")
    MEDIA_HUB_URL: str = os.getenv("MEDIA_HUB_URL", "http://localhost:8080")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    MAX_POSTER_SIZE_MB: int = int(os.getenv("MAX_POSTER_SIZE_MB", "5"))
    ALLOWED_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "webp"]

settings = Settings()
