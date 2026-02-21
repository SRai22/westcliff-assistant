"""
Google Gemini LLM Client Implementation

Wraps the Google Generative AI API to provide structured outputs via the complete() method.
Includes retry logic for validation failures and rate limit handling.
"""
import asyncio
import json
import logging
from typing import Type, TypeVar
from pydantic import BaseModel, ValidationError
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from .client import LLMClient

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class GeminiClient(LLMClient):
    """Google Gemini implementation of the LLM client with retry logic and rate limit handling."""
    
    MAX_RETRIES = 2
    INITIAL_BACKOFF = 1.0  # seconds
    
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash-exp"):
        """
        Initialize the Gemini client.
        
        Args:
            api_key: Google AI API key (never logged)
            model: Model name (e.g., "gemini-2.0-flash-exp", "gemini-1.5-pro")
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)
        self.model_name = model
        logger.info(f"Initialized Gemini client with model: {model}")
    
    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        output_schema: Type[T]
    ) -> T:
        """
        Send a completion request to Gemini and return structured output.
        
        Uses Gemini's controlled generation to produce JSON conforming to the schema.
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
                # Combine system and user prompts (Gemini doesn't have separate system role in all models)
                full_prompt = f"{system_prompt}\n\n{user_prompt}"
                
                # Get the JSON schema
                json_schema = output_schema.model_json_schema()
                
                # Add instruction to return JSON matching the schema
                full_prompt += f"\n\nRespond with valid JSON matching this schema:\n{json.dumps(json_schema, indent=2)}"
                
                # Configure generation parameters
                generation_config = {
                    "temperature": 0.7,
                    "response_mime_type": "application/json",
                }
                
                # Make the API call
                response = await self.model.generate_content_async(
                    full_prompt,
                    generation_config=generation_config
                )
                
                # Extract and parse the response
                content = response.text
                if not content:
                    raise ValueError("Empty response from Gemini")
                
                # Parse JSON and validate with Pydantic
                data = json.loads(content)
                result = output_schema.model_validate(data)
                
                # Success - log and return
                if attempt > 0:
                    logger.info(f"Gemini call succeeded on attempt {attempt + 1}")
                return result
                
            except google_exceptions.ResourceExhausted as e:
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
                    
            except (google_exceptions.GoogleAPIError, google_exceptions.RetryError) as e:
                # Handle other Google API errors
                logger.error(f"Gemini API error (attempt {attempt + 1}/{self.MAX_RETRIES + 1}): {str(e)}")
                last_error = e
                
                if attempt < self.MAX_RETRIES:
                    backoff = self.INITIAL_BACKOFF * (2 ** attempt)
                    await asyncio.sleep(backoff)
                    continue
                else:
                    raise Exception(f"Gemini API error after {self.MAX_RETRIES + 1} attempts: {str(e)}") from e
                    
            except Exception as e:
                # Catch-all for unexpected errors
                logger.error(f"Unexpected error in Gemini client: {str(e)}")
                raise Exception(f"Gemini completion failed: {str(e)}") from e
        
        # Should never reach here, but handle just in case
        raise Exception(f"Gemini completion failed after retries: {str(last_error)}")
