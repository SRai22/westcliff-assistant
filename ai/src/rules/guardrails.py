"""
Guardrails Module for Westcliff AI Service

Provides safety validation, content filtering, and PII sanitization for AI interactions.
All AI responses should pass through these guardrails before being returned to users.

Functions:
    validate_output: Validates AI output for safety and schema compliance
    check_refusal: Detects off-topic, harmful, or out-of-scope queries
    sanitize_for_logging: Strips PII from text before logging
"""
import logging
import re
from typing import Optional

from pydantic import BaseModel

logger = logging.getLogger(__name__)


# =============================================================================
# CONSTANTS
# =============================================================================

# 11 valid Westcliff categories
VALID_CATEGORIES = [
    "Information Technology",
    "Learning Technologies", 
    "Student Services",
    "International Affairs",
    "Registrar",
    "Student Accounts",
    "Financial Aid",
    "Alumni Affairs and Career Services",
    "Military / Veterans",
    "Student Life",
    "Learning Experience Design (LXD) Team",
]

# Standard fallback response for refused queries
FALLBACK_RESPONSE = (
    "I'm here to help with Westcliff University student support questions. "
    "I can assist with topics like enrollment, financial aid, technical support, "
    "academic records, and other student services. How can I help you with your "
    "student support needs today?"
)

# Harmful/inappropriate content patterns
HARMFUL_PATTERNS = [
    # Violence and threats
    r'\b(kill|murder|attack|bomb|weapon|shoot|stab|explode|terrorist)\b',
    # Explicit content
    r'\b(porn|xxx|nude|naked|sex(?:ual)?(?:\s+content)?)\b',
    # Hate speech indicators
    r'\b(hate\s+(?:speech|crime)|racist|nazi|supremacist)\b',
    # Self-harm
    r'\b(suicide|self[- ]?harm|cut\s+(?:my)?self|kill\s+(?:my)?self)\b',
    # Illegal activities
    r'\b(hack(?:ing)?|crack(?:ing)?|pirat(?:e|ing)|cheat(?:ing)?|plagiari(?:sm|ze))\b',
]

# Off-topic patterns (requests outside university support scope)
OFF_TOPIC_PATTERNS = [
    # Poetry and creative writing
    r'\b(write\s+(?:me\s+)?(?:a\s+)?poem|compose\s+(?:a\s+)?song|creative\s+writ(?:e|ing))\b',
    # General AI assistant requests
    r'\b(tell\s+(?:me\s+)?(?:a\s+)?(?:joke|story)|what\s+is\s+the\s+meaning\s+of\s+life)\b',
    r'\b(who\s+(?:is|are|was|were)\s+(?:you|your)|what\s+(?:are|is)\s+you)\b',
    # Role-playing
    r'\b(pretend\s+(?:to\s+be|you\'re)|role\s*play|act\s+(?:as|like))\b',
    # Code generation outside support context
    r'\b(write\s+(?:me\s+)?(?:a\s+)?(?:python|javascript|java|c\+\+)\s+(?:code|program|script))\b',
    # General knowledge queries
    r'\b(what\s+is\s+(?:the\s+)?(?:capital|population|president))\b',
    # Cooking/recipes
    r'\b(recipe\s+for|how\s+to\s+cook|ingredients\s+for)\b',
    # Math homework (unless about tuition/financial)
    r'\b(solve\s+(?:this\s+)?(?:math|equation|problem)|calculate\s+(?:the\s+)?(?:integral|derivative))\b',
]

# Prompt injection patterns (attempts to override system instructions)
INJECTION_PATTERNS = [
    # Direct instruction overrides
    r'(?:ignore|disregard|forget|override)\s+(?:all\s+)?(?:previous|prior|above|system|your)\s+(?:instructions?|prompts?|rules?)',
    r'(?:forget|ignore)\s+(?:your|the)?\s*(?:previous|prior)?\s*(?:instructions?|rules?)\s+(?:and|then)',
    r'(?:new|updated?)\s+(?:instructions?|prompt|rules?)\s*[:=]',
    r'(?:system|admin|root)\s+(?:prompt|instruction|override)',
    r'you\s+(?:are|must)\s+now\s+(?:be|act\s+as|ignore)',
    # Jailbreak attempts
    r'(?:dan|developer|admin)\s+mode',
    r'(?:unlock|enable)\s+(?:hidden|secret|restricted)\s+(?:mode|capabilities)',
    r'(?:bypass|circumvent|ignore)\s+(?:safety|content|ethical)\s+(?:filters?|guidelines?|restrictions?)',
    # Role override attempts
    r'(?:pretend|act|behave)\s+(?:as\s+if\s+)?(?:you\s+)?(?:are|have)\s+no\s+(?:restrictions?|guidelines?|rules?)',
    r'(?:from\s+now\s+on|starting\s+now)\s+(?:you\s+)?(?:will|must|should)\s+(?:not\s+)?follow',
    # Output manipulation
    r'(?:output|print|say|respond\s+with)\s+(?:only|exactly)\s*[:\"]',
    r'(?:respond|reply|answer)\s+(?:in|with)\s+(?:json|xml|code)\s*(?:only|format)',
    # General override attempts
    r'do\s+(?:what\s+)?I\s+(?:say|tell|ask)',
    # Bypass attempts
    r'bypass\s+(?:your\s+)?(?:safety|security|content)\s+(?:filters?|rules?|restrictions?)',
]

# PII patterns for sanitization (order matters - more specific patterns first)
# Using a list of tuples to ensure ordered processing
PII_PATTERNS_ORDERED = [
    # Credit card numbers FIRST (16 digits in groups of 4) - must match before phone
    ("credit_card", r'\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b'),
    # Social Security Numbers (9 digits in 3-2-4 pattern)
    ("ssn", r'\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b'),
    # Student IDs (require "student" keyword nearby followed by digits)
    ("student_id", r'\bstudent\s*(?:id|number|#|no\.?)?(?:\s*(?:is|:|\.)?)?\s*\d{7,10}\b'),
    # Email addresses
    ("email", r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'),
    # IP addresses (must be 4 octets with dots)
    ("ip_address", r'\b(?:\d{1,3}\.){3}\d{1,3}\b'),
    # Dates of birth (require keyword)
    ("dob", r'\b(?:dob|date\s*of\s*birth|birthday)[:.\s]*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b'),
    # US Phone numbers LAST (7-11 digits) - most general pattern
    ("phone", r'(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b'),
]

# Keep dict for backward compatibility
PII_PATTERNS = {name: pattern for name, pattern in PII_PATTERNS_ORDERED}

# Forbidden phrases in AI output (things AI should never promise/claim)
FORBIDDEN_OUTPUT_PHRASES = [
    # Approvals and guarantees
    r'\b(?:i\s+)?(?:hereby\s+)?(?:approve|deny|grant|reject)\s+(?:your|this|the)\b',
    r'\b(?:guaranteed|certain|definite(?:ly)?|assured)\s+(?:to\s+)?(?:receive|get|be\s+approved)\b',
    r'\bwe\s+(?:will|can)\s+(?:guarantee|ensure|promise)\b',
    # Legal/immigration claims
    r'\b(?:legally\s+)?(?:entitled|eligible)\s+to\b',
    r'\byour\s+visa\s+(?:is|has\s+been|will\s+be)\s+(?:approved|valid|extended)\b',
    r'\bimmigration\s+(?:status|eligibility)\s+(?:is|qualifies)\b',
    # Financial promises
    r'\byou\s+will\s+(?:receive|get)\s+\$[\d,]+\b',
    r'\brefund\s+(?:has\s+been|is)\s+(?:approved|processed|guaranteed)\b',
    r'\baid\s+(?:amount|disbursement)\s+(?:is\s+)?(?:guaranteed|confirmed)\b',
]


# =============================================================================
# EXCEPTIONS
# =============================================================================

class GuardrailViolation(Exception):
    """Raised when AI output violates guardrail rules."""
    def __init__(self, message: str, violation_type: str):
        super().__init__(message)
        self.violation_type = violation_type


# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

def validate_output(response: BaseModel) -> tuple[bool, str]:
    """
    Validate AI output for safety issues and guardrail compliance.
    
    Checks performed:
    - Category validation (must be one of 11 valid categories)
    - Confidence score bounds (0.0 to 1.0)
    - Forbidden phrases in text content
    - Inappropriate content in drafts/summaries
    
    Args:
        response: A Pydantic model instance representing AI output
        
    Returns:
        Tuple of (is_valid: bool, message: str)
        If valid, message is "OK"
        If invalid, message describes the violation
        
    Example:
        >>> from schemas.intake import IntakeTriageResponse
        >>> response = IntakeTriageResponse(category="Bad Category", ...)
        >>> valid, msg = validate_output(response)
        >>> print(valid, msg)
        False, "Invalid category 'Bad Category'. Must be one of: ..."
    """
    response_dict = response.model_dump()
    
    # Check for category field
    if "category" in response_dict:
        category = response_dict["category"]
        if category not in VALID_CATEGORIES:
            return (
                False,
                f"Invalid category '{category}'. Must be one of: {', '.join(VALID_CATEGORIES)}"
            )
    
    # Check for confidence field
    if "confidence" in response_dict:
        confidence = response_dict["confidence"]
        if not isinstance(confidence, (int, float)) or not (0.0 <= confidence <= 1.0):
            return (
                False,
                f"Invalid confidence score '{confidence}'. Must be a float between 0.0 and 1.0"
            )
    
    # Check text fields for forbidden phrases
    text_fields = _extract_text_fields(response_dict)
    for field_name, text in text_fields:
        # Check for forbidden output phrases
        for pattern in FORBIDDEN_OUTPUT_PHRASES:
            if re.search(pattern, text, re.IGNORECASE):
                return (
                    False,
                    f"Output contains forbidden phrase in '{field_name}': "
                    f"AI must not make promises, approvals, or legal claims"
                )
        
        # Check for harmful content
        for pattern in HARMFUL_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                return (
                    False,
                    f"Output contains potentially harmful content in '{field_name}'"
                )
    
    # Check for requiresStaffReview (must always be True for drafts)
    if "requiresStaffReview" in response_dict:
        if response_dict["requiresStaffReview"] is not True:
            return (
                False,
                "Draft replies must always require staff review (requiresStaffReview must be True)"
            )
    
    return (True, "OK")


def check_refusal(text: str) -> Optional[str]:
    """
    Detect off-topic, harmful, or out-of-scope queries and return a fallback response.
    
    This function is the first line of defense against misuse. It checks user input
    BEFORE sending to the LLM to:
    - Prevent prompt injection attempts
    - Refuse harmful content requests
    - Redirect off-topic queries
    - Block inappropriate content
    
    Args:
        text: User's input text to check
        
    Returns:
        None if the query is acceptable and should be processed
        A fallback response string if the query should be refused
        
    Example:
        >>> result = check_refusal("write me a poem about love")
        >>> print(result)
        "I'm here to help with Westcliff University student support questions..."
        
        >>> result = check_refusal("I can't log into Canvas")
        >>> print(result)
        None  # This is a valid support query
    """
    text_lower = text.lower().strip()
    
    # Empty or very short input
    if len(text_lower) < 3:
        return "I didn't receive a complete question. Could you please describe your support request in more detail?"
    
    # Check for prompt injection attempts
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            logger.warning(f"Detected prompt injection attempt: {sanitize_for_logging(text[:100])}")
            return FALLBACK_RESPONSE
    
    # Check for harmful content
    for pattern in HARMFUL_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            logger.warning(f"Detected harmful content request: {sanitize_for_logging(text[:100])}")
            return (
                "I'm not able to assist with that type of request. "
                "If you're experiencing a crisis, please contact emergency services "
                "or the campus counseling center. For student support questions, "
                "I'm happy to help with enrollment, financial aid, technical support, "
                "and other university services."
            )
    
    # Check for off-topic patterns
    for pattern in OFF_TOPIC_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            logger.info(f"Detected off-topic query: {sanitize_for_logging(text[:100])}")
            return FALLBACK_RESPONSE
    
    # Check for gibberish/nonsense (very long words or excessive non-alphanumeric)
    words = text.split()
    if words:
        avg_word_len = sum(len(w) for w in words) / len(words)
        if avg_word_len > 25:  # Average word length over 25 is suspicious
            return "I couldn't understand your request. Could you please rephrase your question about student support services?"
    
    # Check for excessive special characters (potential encoding attack)
    special_char_ratio = len(re.findall(r'[^a-zA-Z0-9\s.,!?\'"-]', text)) / max(len(text), 1)
    if special_char_ratio > 0.3:  # More than 30% special characters
        return "I had trouble reading your message. Could you please rephrase your question using standard text?"
    
    # Legitimate query - proceed
    return None


def sanitize_for_logging(text: str) -> str:
    """
    Strip potential PII from text before logging.
    
    This function redacts sensitive information to comply with privacy
    requirements and prevent PII from appearing in logs. Use this before
    any logging of user input or AI output.
    
    Sanitizes:
    - Email addresses → [EMAIL]
    - Phone numbers → [PHONE]  
    - SSN → [SSN]
    - Credit card numbers → [CREDIT_CARD]
    - Student IDs → [STUDENT_ID]
    - IP addresses → [IP_ADDRESS]
    - Dates of birth → [DOB]
    
    Args:
        text: Text that may contain PII
        
    Returns:
        Text with PII patterns replaced by placeholders
        
    Example:
        >>> sanitize_for_logging("Contact john@email.com or 555-123-4567")
        "Contact [EMAIL] or [PHONE]"
    """
    if not text:
        return text
    
    sanitized = text
    
    # Use ordered patterns to ensure more specific patterns match first
    for pii_type, pattern in PII_PATTERNS_ORDERED:
        placeholder = f"[{pii_type.upper()}]"
        sanitized = re.sub(pattern, placeholder, sanitized, flags=re.IGNORECASE)
    
    return sanitized


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def _extract_text_fields(data: dict, prefix: str = "") -> list[tuple[str, str]]:
    """
    Recursively extract all text fields from a dictionary.
    
    Args:
        data: Dictionary to extract from
        prefix: Field name prefix for nested fields
        
    Returns:
        List of (field_name, text_value) tuples
    """
    results = []
    
    for key, value in data.items():
        field_name = f"{prefix}.{key}" if prefix else key
        
        if isinstance(value, str) and value.strip():
            results.append((field_name, value))
        elif isinstance(value, dict):
            results.extend(_extract_text_fields(value, field_name))
        elif isinstance(value, list):
            for i, item in enumerate(value):
                if isinstance(item, str) and item.strip():
                    results.append((f"{field_name}[{i}]", item))
                elif isinstance(item, dict):
                    results.extend(_extract_text_fields(item, f"{field_name}[{i}]"))
    
    return results


def check_content_safety(text: str) -> tuple[bool, Optional[str]]:
    """
    Check if content is safe to include in AI responses.
    
    This is a convenience function that combines multiple safety checks
    that should be run on content before including it in responses.
    
    Args:
        text: Content to check
        
    Returns:
        Tuple of (is_safe: bool, reason: Optional[str])
        If unsafe, reason describes why
    """
    # Check for harmful patterns
    for pattern in HARMFUL_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return (False, "Contains potentially harmful content")
    
    # Check for forbidden phrases
    for pattern in FORBIDDEN_OUTPUT_PHRASES:
        if re.search(pattern, text, re.IGNORECASE):
            return (False, "Contains forbidden phrases (promises, approvals, etc.)")
    
    return (True, None)


def validate_category(category: str) -> bool:
    """
    Check if a category is valid.
    
    Args:
        category: Category string to validate
        
    Returns:
        True if valid, False otherwise
    """
    return category in VALID_CATEGORIES


def get_valid_categories() -> list[str]:
    """
    Get the list of valid categories.
    
    Returns:
        List of valid category strings
    """
    return VALID_CATEGORIES.copy()
