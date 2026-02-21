"""
Abstract LLM Client Interface

Provides a unified interface for different LLM providers (OpenAI, Gemini).
All implementations must return Pydantic-validated structured outputs.
"""
from abc import ABC, abstractmethod
from typing import Type, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class LLMClient(ABC):
    """Abstract base class for LLM providers."""
    
    @abstractmethod
    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        output_schema: Type[T]
    ) -> T:
        """
        Send a completion request to the LLM and return structured output.
        
        Args:
            system_prompt: The system instruction/context for the LLM
            user_prompt: The user's message/query
            output_schema: A Pydantic model class defining the expected output structure
            
        Returns:
            An instance of output_schema populated with the LLM's response
            
        Raises:
            Exception: If the LLM call fails or returns invalid output
        """
        pass


def get_llm_client() -> LLMClient:
    """
    Factory function to get the appropriate LLM client based on configuration.
    
    Returns:
        An instance of the configured LLM client (OpenAI or Gemini)
        
    Raises:
        ValueError: If an unsupported provider is specified
        ValueError: If required API keys are missing
    """
    from ..config import settings
    
    # Validate provider configuration
    settings.validate_provider_config()
    
    if settings.llm_provider == "openai":
        from .openai_client import OpenAIClient
        return OpenAIClient(
            api_key=settings.openai_api_key,
            model=settings.llm_model,
            base_url=settings.openai_endpoint
        )
    elif settings.llm_provider == "gemini":
        from .gemini_client import GeminiClient
        return GeminiClient(
            api_key=settings.google_api_key,
            model=settings.llm_model
        )
    else:
        raise ValueError(
            f"Unsupported LLM provider: {settings.llm_provider}. "
            f"Supported providers: openai, gemini"
        )
