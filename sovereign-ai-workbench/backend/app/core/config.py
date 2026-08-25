"""
Core application settings managed via Pydantic BaseSettings.
Loads environment variables safely without hardcoding secrets.
"""

from functools import lru_cache
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Settings configuration.
    Values can be overridden by environment variables or a .env file.
    """
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    # General App Settings
    APP_NAME: str = "Sovereign AI Workbench"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"

    # Server Binding
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS Allowed Origins
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    # Security Configuration
    JWT_SECRET: str = Field(
        default="default-dev-secret-do-not-use-in-production-min-32-chars",
        description="Secret key for signing JWT tokens."
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Database Configuration (PostgreSQL)
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/sovereign_workbench",
        description="Async connection string for relational DB."
    )
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    # Vector Database Configuration (Qdrant)
    QDRANT_URL: str = Field(
        default="http://localhost:6333",
        description="Base URL for Qdrant vector database."
    )
    QDRANT_API_KEY: str = ""

    # Local LLM Inference Engine (Ollama)
    OLLAMA_BASE_URL: str = Field(
        default="http://localhost:11434",
        description="Base URL for local Ollama instance."
    )
    DEFAULT_LLM_MODEL: str = "llama3:8b"
    DEFAULT_EMBEDDING_MODEL: str = "nomic-embed-text"

    # File System & Workspace Directories
    UPLOAD_DIRECTORY: str = "./uploads"
    WORKSPACE_DIRECTORY: str = "./workspace"
    MAX_UPLOAD_SIZE_MB: int = 50

    # Sandbox Isolation Limits
    SANDBOX_TIMEOUT_SECONDS: int = 30
    SANDBOX_MEMORY_LIMIT: str = "512m"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Union[str, List[str]]) -> List[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache()
def get_settings() -> Settings:
    """
    Cached accessor for application settings.
    Ensures .env is parsed only once per process lifecycle.
    """
    return Settings()


settings = get_settings()
