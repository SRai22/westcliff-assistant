"""
Rules module for Westcliff AI Service.

Provides guardrails, safety checks, and content filtering for AI interactions.
"""
from .guardrails import (
    validate_output,
    check_refusal,
    sanitize_for_logging,
    check_content_safety,
    validate_category,
    get_valid_categories,
    GuardrailViolation,
    FALLBACK_RESPONSE,
    VALID_CATEGORIES,
)

__all__ = [
    "validate_output",
    "check_refusal", 
    "sanitize_for_logging",
    "check_content_safety",
    "validate_category",
    "get_valid_categories",
    "GuardrailViolation",
    "FALLBACK_RESPONSE",
    "VALID_CATEGORIES",
]
