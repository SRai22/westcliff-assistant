"""
OpenAI LLM Client Implementation

Wraps the OpenAI API to provide structured outputs via the complete() method.
Includes retry logic for validation failures and rate limit handling.
"""
import asyncio
import json
import logging
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError
from openai import AsyncOpenAI, RateLimitError, APIError

from .client import LLMClient

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class OpenAIClient(LLMClient):
    """OpenAI implementation of the LLM client with retry logic and rate limit handling."""
    
    MAX_RETRIES = 2
    INITIAL_BACKOFF = 1.0  # seconds
    
    def __init__(self, api_key: str, model: str = "gpt-4o", base_url: str | None = None):
        """
        Initialize the OpenAI client.
        
        Args:
            api_key: OpenAI API key (never logged)
            model: Model name (e.g., "gpt-4o", "gpt-4o-mini", "gpt-oss-120b")
            base_url: Optional custom API endpoint (e.g., for Azure OpenAI)
        """
        if base_url:
            self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
            logger.info(f"Initialized OpenAI client with model: {model} (custom endpoint)")
        else:
            self.client = AsyncOpenAI(api_key=api_key)
            logger.info(f"Initialized OpenAI client with model: {model}")
        self.model = model
    
    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        output_schema: Type[T]
    ) -> T:
        """
        Send a completion request to OpenAI and return structured output.
        
        Uses OpenAI's Structured Outputs feature to guarantee schema compliance.
        Implements retry logic (up to 2 retries) for validation failures and
        exponential backoff for rate limit errors.
        
        Args:
            system_prompt: The system instruction/context for the LLM
            user_prompt: The user's message/query
            output_schema: A Pydantic model class defining the expected output structure
            
        Returns:
            An instance of output_schema populated with the LLM's response
            
        Raises:
            Exception: If the API call fails after all retries or returns invalid output
        """
        last_error = None
        
        for attempt in range(self.MAX_RETRIES + 1):
            try:
                # Convert Pydantic model to JSON schema for OpenAI
                response_format = {
                    "type": "json_schema",
                    "json_schema": {
                        "name": output_schema.__name__,
                        "schema": output_schema.model_json_schema(),
                        "strict": True
                    }
                }
                
                # Make the API call
                completion = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    response_format=response_format,
                    temperature=0.7
                )
                
                # Extract and parse the response
                content = completion.choices[0].message.content
                if not content:
                    raise ValueError("Empty response from OpenAI")
                
                # Parse JSON and validate with Pydantic
                data = json.loads(content)
                result = output_schema.model_validate(data)
                
                # Success - log and return
                if attempt > 0:
                    logger.info(f"OpenAI call succeeded on attempt {attempt + 1}")
                return result
                
            except RateLimitError as e:
                # Handle rate limit with exponential backoff
                backoff = self.INITIAL_BACKOFF * (2 ** attempt)
                logger.warning(f"Rate limit hit (attempt {attempt + 1}/{self.MAX_RETRIES + 1}). "
                             f"Retrying in {backoff}s...")
                last_error = e
                
                if attempt < self.MAX_RETRIES:
                    await asyncio.sleep(backoff)
                    continue
                else:
                    raise Exception(f"Rate limit exceeded after {self.MAX_RETRIES + 1} attempts") from e
                    
            except (ValidationError, json.JSONDecodeError) as e:
                # Handle validation failures with retry
                logger.warning(f"Validation failed (attempt {attempt + 1}/{self.MAX_RETRIES + 1}): {str(e)}")
                last_error = e
                
                if attempt < self.MAX_RETRIES:
                    # Brief delay before retry
                    await asyncio.sleep(0.5)
                    continue
                else:
                    raise Exception(
                        f"Schema validation failed after {self.MAX_RETRIES + 1} attempts: {str(e)}"
                    ) from e
                    
            except APIError as e:
                # Handle other API errors
                logger.error(f"OpenAI API error (attempt {attempt + 1}/{self.MAX_RETRIES + 1}): {str(e)}")
                last_error = e
                
                if attempt < self.MAX_RETRIES:
                    backoff = self.INITIAL_BACKOFF * (2 ** attempt)
                    await asyncio.sleep(backoff)
                    continue
                else:
                    raise Exception(f"OpenAI API error after {self.MAX_RETRIES + 1} attempts: {str(e)}") from e
                    
            except Exception as e:
                # Catch-all for unexpected errors
                logger.error(f"Unexpected error in OpenAI client: {str(e)}")
                raise Exception(f"OpenAI completion failed: {str(e)}") from e
        
        # Should never reach here, but handle just in case
        raise Exception(f"OpenAI completion failed after retries: {str(last_error)}")
