"""
Pydantic schemas for intake triage and followup endpoints.

These schemas define the request/response contracts for the AI intake flow,
where students describe their issues and the AI helps categorize and clarify them.
"""
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


# 11 categories from the Westcliff system
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

# Valid priorities
VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"]

# Valid handoff recommendations
VALID_HANDOFF_RECOMMENDATIONS = ["ARTICLE_FIRST", "CREATE_TICKET"]


class TicketDraft(BaseModel):
    """Draft ticket structure returned by AI."""
    summary: str = Field(
        ...,
        min_length=5,
        max_length=200,
        description="Brief summary of the issue"
    )
    description: str = Field(
        ...,
        min_length=10,
        description="Detailed description of the issue"
    )
    priority: Literal["LOW", "MEDIUM", "HIGH"] = Field(
        ...,
        description="Suggested priority level"
    )


class IntakeTriageRequest(BaseModel):
    """Request schema for initial intake triage."""
    text: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Student's description of their issue"
    )
    userContext: Optional[dict] = Field(
        default=None,
        description="Optional context about the user (role, program, etc.)"
    )

    @field_validator('text')
    @classmethod
    def text_not_empty(cls, v: str) -> str:
        """Ensure text is not just whitespace."""
        if not v.strip():
            raise ValueError("Text cannot be empty or only whitespace")
        return v.strip()


class IntakeTriageResponse(BaseModel):
    """Response schema for intake triage."""
    category: str = Field(
        ...,
        description="One of the 11 valid support categories"
    )
    service: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Specific service or subtopic within the category"
    )
    clarifyingQuestions: list[str] = Field(
        default_factory=list,
        min_length=0,
        max_length=4,
        description="2-4 clarifying questions to ask the student"
    )
    suggestedArticleIds: list[str] = Field(
        default_factory=list,
        max_length=3,
        description="0-3 relevant knowledge base article IDs"
    )
    ticketDraft: TicketDraft = Field(
        ...,
        description="Draft ticket with summary, description, and priority"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence score between 0 and 1"
    )
    handoffRecommendation: Literal["ARTICLE_FIRST", "CREATE_TICKET"] = Field(
        ...,
        description="Recommendation for next step"
    )

    @field_validator('category')
    @classmethod
    def category_must_be_valid(cls, v: str) -> str:
        """Ensure category is one of the 11 valid categories."""
        if v not in VALID_CATEGORIES:
            raise ValueError(
                f"Invalid category '{v}'. Must be one of: {', '.join(VALID_CATEGORIES)}"
            )
        return v

    @field_validator('clarifyingQuestions')
    @classmethod
    def questions_not_empty(cls, v: list[str]) -> list[str]:
        """Ensure questions are not empty strings."""
        return [q.strip() for q in v if q.strip()]


class IntakeFollowupRequest(BaseModel):
    """Request schema for intake followup after student answers questions."""
    triageResult: IntakeTriageResponse = Field(
        ...,
        description="Original triage result"
    )
    answers: list[str] = Field(
        ...,
        min_length=1,
        description="Student's answers to clarifying questions"
    )

    @field_validator('answers')
    @classmethod
    def answers_not_empty(cls, v: list[str]) -> list[str]:
        """Ensure answers are not empty strings."""
        cleaned = [a.strip() for a in v if a.strip()]
        if not cleaned:
            raise ValueError("At least one answer must be provided")
        return cleaned


class IntakeFollowupResponse(BaseModel):
    """Response schema for intake followup."""
    category: str = Field(
        ...,
        description="Possibly refined category based on answers"
    )
    service: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Possibly refined service based on answers"
    )
    ticketDraft: TicketDraft = Field(
        ...,
        description="Refined ticket draft with more details"
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Updated confidence score"
    )
    additionalContext: Optional[str] = Field(
        default=None,
        description="Additional context discovered from answers"
    )

    @field_validator('category')
    @classmethod
    def category_must_be_valid(cls, v: str) -> str:
        """Ensure category is one of the 11 valid categories."""
        if v not in VALID_CATEGORIES:
            raise ValueError(
                f"Invalid category '{v}'. Must be one of: {', '.join(VALID_CATEGORIES)}"
            )
        return v
