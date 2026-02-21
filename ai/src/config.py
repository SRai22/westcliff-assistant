"""
AI Service Configuration

Loads environment variables for LLM provider selection and API keys.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # LLM Provider Configuration
    llm_provider: Literal["openai", "gemini"] = "openai"
    llm_model: str = "gpt-4o"
    
    # API Keys
    openai_api_key: str | None = None
    openai_endpoint: str | None = None
    google_api_key: str | None = None
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8001
    
    # CORS Configuration
    cors_origins: list[str] = ["*"]

    def validate_provider_config(self) -> None:
        """Validate that required API keys are present for the selected provider."""
        if self.llm_provider == "openai" and not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER=openai")
        if self.llm_provider == "gemini" and not self.google_api_key:
            raise ValueError("GOOGLE_API_KEY is required when LLM_PROVIDER=gemini")


# Global settings instance
settings = Settings()
