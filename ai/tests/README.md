# AI Service Tests

Test suite for the Westcliff AI Service LLM clients.

## Setup

Ensure you have the required API keys set in your `.env` file:

```bash
# For OpenAI (including Azure OpenAI)
OPENAI_API_KEY=your-key-here
OPENAI_ENDPOINT=https://your-endpoint.com/openai/v1/  # Optional: for Azure OpenAI
LLM_MODEL=gpt-4o  # or gpt-oss-120b for Azure

# For Google Gemini
GOOGLE_API_KEY=your-key-here
LLM_MODEL=gemini-2.0-flash-exp
```

## Running Tests

### Verify Setup
Check that all modules load correctly:
```bash
python tests/verify_setup.py
```

### Test OpenAI Client
Tests OpenAI client with retry logic and rate limit handling:
```bash
python tests/test_openai_client.py
```

**Features tested:**
- Structured output with Pydantic validation
- Retry logic (up to 2 retries)
- Rate limit handling with exponential backoff
- API key security (keys never logged)

### Test Gemini Client
Tests Google Gemini client with identical features:
```bash
# Set Gemini as provider
export LLM_PROVIDER=gemini
export LLM_MODEL=gemini-2.0-flash-exp

python tests/test_gemini_client.py
```

### Test Provider Switching
Verifies both providers produce identical schema shapes:
```bash
python tests/test_provider_switching.py
```

This test will automatically detect available API keys and test all configured providers, comparing output schemas to ensure compatibility.

### Test Pydantic Schemas (AI-04)
Tests all request/response schemas for intake and assist endpoints:
```bash
# Test intake schemas
python tests/test_schemas_intake.py

# Test assist schemas
python tests/test_schemas_assist.py

# Run comprehensive QA tests for AI-04
python tests/test_qa_ai04.py
```

**Features tested:**
- All 11 valid categories are accepted
- Invalid categories are rejected with clear error messages
- Confidence scores are constrained to 0-1 range
- Field validators enforce data quality (no empty strings, length limits, etc.)
- All required fields are validated

## Test Files

- `verify_setup.py` - Module import and configuration verification
- `test_openai_client.py` - OpenAI client functionality
- `test_gemini_client.py` - Gemini client functionality
- `test_provider_switching.py` - Cross-provider compatibility
- `test_schemas_intake.py` - Intake schema validation (AI-04)
- `test_schemas_assist.py` - Assist schema validation (AI-04)
- `test_qa_ai04.py` - Comprehensive QA tests for AI-04 acceptance criteria

## Expected Output

All tests should:
- ✓ Successfully create LLM client
- ✓ Return structured Pydantic-validated output
- ✓ Show retry mechanism is ready
- ✓ Never display API keys in logs
- ✓ Handle rate limits gracefully

## Retry Logic

Both clients implement:
- **MAX_RETRIES**: 2 retries (3 total attempts)
- **Validation failures**: 0.5s delay between retries
- **Rate limits**: Exponential backoff (1s, 2s, 4s)
- **API errors**: Exponential backoff with retries
