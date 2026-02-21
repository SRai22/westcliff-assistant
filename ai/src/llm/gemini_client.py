"""
Google Gemini LLM Client Implementation

Wraps the Google Generative AI API to provide structured outputs via the complete() method.
"""
import json
from typing import Type, TypeVar
from pydantic import BaseModel
import google.generativeai as genai

from .client import LLMClient

T = TypeVar("T", bound=BaseModel)


class GeminiClient(LLMClient):
    """Google Gemini implementation of the LLM client."""
    
    def __init__(self, api_key: str, model: str = "gemini-2.0-flash-exp"):
        """
        Initialize the Gemini client.
        
        Args:
            api_key: Google AI API key
            model: Model name (e.g., "gemini-2.0-flash-exp", "gemini-1.5-pro")
        """
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model)
        self.model_name = model
    
    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        output_schema: Type[T]
    ) -> T:
        """
        Send a completion request to Gemini and return structured output.
        
        Uses Gemini's controlled generation to produce JSON conforming to the schema.
        
        Args:
            system_prompt: The system instruction/context for the LLM
            user_prompt: The user's message/query
            output_schema: A Pydantic model class defining the expected output structure
            
        Returns:
            An instance of output_schema populated with the LLM's response
            
        Raises:
            Exception: If the API call fails or returns invalid output
        """
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
            return output_schema.model_validate(data)
            
        except json.JSONDecodeError as e:
            raise Exception(f"Gemini returned invalid JSON: {str(e)}") from e
        except Exception as e:
            raise Exception(f"Gemini completion failed: {str(e)}") from e
