import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.environ.get("DATABASE_URL", "")
    secret_key: str = os.environ.get("SECRET_KEY", "apteka-hms-secret-key-change-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7

    class Config:
        env_file = ".env"

settings = Settings()
