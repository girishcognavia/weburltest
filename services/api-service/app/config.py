from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Server
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DEBUG: bool = True

    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PASSWORD: str = ""

    # Services
    PROXY_SERVICE_URL: str = "http://localhost:3000"
    SCREENSHOT_SERVICE_URL: str = "http://localhost:3001"

    # Session
    SESSION_TTL: int = 86400  # 24 hours
    PREVIEW_CACHE_TTL: int = 300  # 5 minutes

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
