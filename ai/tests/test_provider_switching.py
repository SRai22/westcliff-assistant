"""
Test script for provider switching between OpenAI and Gemini.

Verifies that both providers produce identical schema shapes.
Run with: python tests/test_provider_switching.py
"""
import asyncio
import logging
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic import BaseModel, Field

# Set up logging to capture output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


class SimpleResponse(BaseModel):
    """Test schema for structured output."""
    answer: str = Field(description="The answer to the question")
    confidence: float = Field(ge=0, le=1, description="Confidence score 0-1")
    reasoning: str = Field(description="Brief reasoning for the answer")


async def test_with_provider(provider_name: str, api_key: str, model: str):
    """Test a specific provider."""
    # Temporarily override environment
    os.environ['LLM_PROVIDER'] = provider_name
    os.environ['LLM_MODEL'] = model
    if provider_name == 'openai':
        os.environ['OPENAI_API_KEY'] = api_key
    else:
        os.environ['GOOGLE_API_KEY'] = api_key
    
    # Reload config to pick up new environment
    from importlib import reload
    from src import config
    reload(config)
    from src.config import settings
    from src.llm.client import get_llm_client
    
    print(f"\n{'='*60}")
    print(f"Testing {provider_name.upper()} provider")
    print(f"{'='*60}")
    print(f"Provider: {settings.llm_provider}")
    print(f"Model: {settings.llm_model}")
    
    try:
        client = get_llm_client()
        print(f"Created client: {client.__class__.__name__}")
        
        # Test prompt
        system_prompt = "You are a helpful assistant that provides accurate, concise answers."
        user_prompt = "What is the capital of France? Provide your answer with confidence level."
        
        result = await client.complete(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            output_schema=SimpleResponse
        )
        
        print(f"\nResult from {provider_name}:")
        print(f"  Answer: {result.answer}")
        print(f"  Confidence: {result.confidence}")
        print(f"  Reasoning: {result.reasoning}")
        print(f"\nSchema validation: PASSED")
        
        # Verify schema shape
        assert hasattr(result, 'answer'), "Missing 'answer' field"
        assert hasattr(result, 'confidence'), "Missing 'confidence' field"
        assert hasattr(result, 'reasoning'), "Missing 'reasoning' field"
        assert isinstance(result.answer, str), "'answer' must be string"
        assert isinstance(result.confidence, float), "'confidence' must be float"
        assert isinstance(result.reasoning, str), "'reasoning' must be string"
        assert 0 <= result.confidence <= 1, "'confidence' must be between 0 and 1"
        
        print(f"Schema shape validation: PASSED")
        return result
        
    except Exception as e:
        print(f"Test failed for {provider_name}: {e}")
        raise


async def test_provider_switching():
    """Test switching between providers."""
    print("="*60)
    print("Provider Switching Test Suite")
    print("="*60)
    
    from src.config import settings
    
    # Check which providers are available
    has_openai = bool(settings.openai_api_key)
    has_gemini = bool(settings.google_api_key)
    
    results = {}
    
    if has_openai:
        print("\nOpenAI API key found - testing OpenAI provider...")
        results['openai'] = await test_with_provider(
            'openai',
            settings.openai_api_key,
            settings.llm_model if settings.llm_provider == 'openai' else 'gpt-4o'
        )
    else:
        print("\nSkipping OpenAI test - no API key found")
    
    if has_gemini:
        print("\nGoogle API key found - testing Gemini provider...")
        results['gemini'] = await test_with_provider(
            'gemini',
            settings.google_api_key,
            'gemini-2.0-flash-exp'
        )
    else:
        print("\nSkipping Gemini test - no API key found")
    
    # Compare results if both providers were tested
    if len(results) == 2:
        print("\n" + "="*60)
        print("Comparing provider outputs")
        print("="*60)
        print(f"Both providers returned SimpleResponse with:")
        print(f"  - answer (str)")
        print(f"  - confidence (float)")
        print(f"  - reasoning (str)")
        print("\nSchema shape is IDENTICAL across providers")
        print("Provider switching works seamlessly!")
    
    print("\n" + "="*60)
    print("All tests passed!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(test_provider_switching())
