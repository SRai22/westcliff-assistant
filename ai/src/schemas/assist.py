"""
Pydantic schemas for staff assist endpoints.

These schemas define the request/response contracts for AI-powered staff assistance,
including ticket summarization and reply drafting.
"""
from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator


class TicketMessage(BaseModel):
    """A message in a ticket conversation."""
    sender: Literal["STUDENT", "STAFF"] = Field(
        ...,
        description="Who sent the message"
    )
    content: str = Field(
        ...,
        min_length=1,
        description="Message content"
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="ISO timestamp of when the message was sent"
    )


class SummarizeRequest(BaseModel):
    """Request schema for ticket summarization."""
    ticketId: str = Field(
        ...,
        min_length=1,
        description="ID of the ticket to summarize"
    )
    messages: list[TicketMessage] = Field(
        ...,
        min_length=1,
        description="All messages in the ticket conversation"
    )

    @field_validator('messages')
    @classmethod
    def must_have_messages(cls, v: list[TicketMessage]) -> list[TicketMessage]:
        """Ensure at least one message is provided."""
        if not v:
            raise ValueError("At least one message must be provided")
        return v


class SummarizeResponse(BaseModel):
    """Response schema for ticket summarization."""
    summary: str = Field(
        ...,
        min_length=20,
        max_length=1000,
        description="Concise summary of the ticket conversation"
    )
    keyPoints: list[str] = Field(
        default_factory=list,
        max_length=5,
        description="0-5 key points from the conversation"
    )
    sentiment: Optional[Literal["POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"]] = Field(
        default=None,
        description="Overall sentiment or urgency of the ticket"
    )


class DraftReplyRequest(BaseModel):
    """Request schema for drafting a reply."""
    ticketId: str = Field(
        ...,
        min_length=1,
        description="ID of the ticket to reply to"
    )
    messages: list[TicketMessage] = Field(
        ...,
        min_length=1,
        description="All messages in the ticket conversation"
    )
    tone: Optional[Literal["PROFESSIONAL", "FRIENDLY", "EMPATHETIC", "CONCISE"]] = Field(
        default="PROFESSIONAL",
        description="Desired tone for the reply"
    )
    context: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Additional context or instructions for the reply"
    )

    @field_validator('messages')
    @classmethod
    def must_have_messages(cls, v: list[TicketMessage]) -> list[TicketMessage]:
        """Ensure at least one message is provided."""
        if not v:
            raise ValueError("At least one message must be provided")
        return v


class DraftReplyResponse(BaseModel):
    """Response schema for draft reply."""
    draft: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="AI-generated draft reply"
    )
    suggestedNextSteps: list[str] = Field(
        default_factory=list,
        max_length=4,
        description="0-4 suggested next steps or action items"
    )
    requiresStaffReview: bool = Field(
        default=True,
        description="Whether this draft requires staff review before sending"
    )

    @field_validator('draft')
    @classmethod
    def draft_not_empty(cls, v: str) -> str:
        """Ensure draft is not just whitespace."""
        if not v.strip():
            raise ValueError("Draft cannot be empty or only whitespace")
        return v.strip()
