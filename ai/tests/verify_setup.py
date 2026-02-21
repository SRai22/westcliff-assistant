"""
Quick verification script to test both LLM clients are properly configured.

Run with: python tests/verify_setup.py
"""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))


def verify_imports():
    """Verify all required modules can be imported."""
    print("="*60)
    print("Verifying AI Service Setup")
    print("="*60)
    
    try:
        from src.config import settings
        print("\n[PASS] Configuration module loaded")
        print(f"  - LLM Provider: {settings.llm_provider}")
        print(f"  - LLM Model: {settings.llm_model}")
        print(f"  - OpenAI Key: {'SET' if settings.openai_api_key else 'NOT SET'}")
        print(f"  - OpenAI Endpoint: {'SET' if settings.openai_endpoint else 'NOT SET'}")
        print(f"  - Google Key: {'SET' if settings.google_api_key else 'NOT SET'}")
    except Exception as e:
        print(f"\n[FAIL] Configuration error: {e}")
        return False
    
    try:
        from src.llm.client import LLMClient, get_llm_client
        print("\n[PASS] LLM client interface loaded")
    except Exception as e:
        print(f"\n[FAIL] LLM client interface error: {e}")
        return False
    
    try:
        from src.llm.openai_client import OpenAIClient
        print("[PASS] OpenAI client loaded")
    except Exception as e:
        print(f"[FAIL] OpenAI client error: {e}")
        return False
    
    try:
        from src.llm.gemini_client import GeminiClient
        print("[PASS] Gemini client loaded")
    except Exception as e:
        print(f"[FAIL] Gemini client error: {e}")
        return False
    
    try:
        client = get_llm_client()
        print(f"\n[PASS] Factory created client: {client.__class__.__name__}")
        print(f"  - Retry logic: MAX_RETRIES = {client.MAX_RETRIES}")
        print(f"  - Initial backoff: {client.INITIAL_BACKOFF}s")
    except Exception as e:
        print(f"\n[FAIL] Factory error: {e}")
        return False
    
    print("\n" + "="*60)
    print("All modules loaded successfully!")
    print("="*60)
    
    # Provide test instructions
    print("\nTo test the clients:")
    print("  OpenAI:  python tests/test_openai_client.py")
    print("  Gemini:  python tests/test_gemini_client.py")
    print("  Switch:  python tests/test_provider_switching.py")
    
    return True


if __name__ == "__main__":
    success = verify_imports()
    sys.exit(0 if success else 1)
