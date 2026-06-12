from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_name: str = "Marketing App API"
    debug: bool = False
    api_prefix: str = "/api/v1"
    cors_origins: list[str] = ["http://localhost:3000"]

    # LLM — unified keys, provider declares which protocol to use
    llm_provider: str = "openai"   # openai | anthropic | gemini
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_api_base: str | None = None  # e.g. https://www.deeprouter.top

    # PostgreSQL
    database_url: str = "postgresql+asyncpg://marketing:marketing@localhost:5432/marketing"

    # Object storage (S3 / R2)
    storage_endpoint_url: str | None = None
    storage_bucket: str = "marketing-assets"
    storage_access_key: str = ""
    storage_secret_key: str = ""
    storage_region: str = "auto"
    storage_public_base_url: str = ""

    # Redis queue (optional)
    redis_url: str = "redis://localhost:6379/0"
    use_queue: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
