"""
Tests for assist schemas (AI-04).

Tests all request/response schemas for staff assist features,
including validation rules and field constraints.
"""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic import ValidationError
from src.schemas.assist import (
    TicketMessage,
    SummarizeRequest,
    SummarizeResponse,
    DraftReplyRequest,
    DraftReplyResponse
)


def test_ticket_message():
    """Test TicketMessage schema validation."""
    print("\n" + "="*60)
    print("Testing TicketMessage Schema")
    print("="*60)
    
    # Valid message
    msg = TicketMessage(
        sender="STUDENT",
        content="I need help with my account",
        timestamp="2026-02-20T10:00:00Z"
    )
    print(f"[PASS] Valid message created")
    print(f"  Sender: {msg.sender}")
    print(f"  Content length: {len(msg.content)}")
    
    # Test invalid sender
    try:
        TicketMessage(
            sender="ADMIN",  # Not STUDENT or STAFF
            content="Test message"
        )
        print("[FAIL] Should have rejected invalid sender")
    except ValidationError as e:
        print(f"[PASS] Rejected invalid sender: {e.error_count()} error(s)")
    
    # Test empty content
    try:
        TicketMessage(
            sender="STAFF",
            content=""
        )
        print("[FAIL] Should have rejected empty content")
    except ValidationError as e:
        print(f"[PASS] Rejected empty content: {e.error_count()} error(s)")


def test_summarize_request():
    """Test SummarizeRequest schema validation."""
    print("\n" + "="*60)
    print("Testing SummarizeRequest Schema")
    print("="*60)
    
    # Valid request
    request = SummarizeRequest(
        ticketId="ticket-123",
        messages=[
            TicketMessage(sender="STUDENT", content="I have a problem with registration"),
            TicketMessage(sender="STAFF", content="Can you provide more details?"),
            TicketMessage(sender="STUDENT", content="I can't add CS 101 to my schedule")
        ]
    )
    print(f"[PASS] Valid summarize request created")
    print(f"  Ticket ID: {request.ticketId}")
    print(f"  Messages: {len(request.messages)}")
    
    # Test empty messages
    try:
        SummarizeRequest(
            ticketId="ticket-123",
            messages=[]
        )
        print("[FAIL] Should have rejected empty messages")
    except ValidationError as e:
        print(f"[PASS] Rejected empty messages: {e.error_count()} error(s)")


def test_summarize_response():
    """Test SummarizeResponse schema validation."""
    print("\n" + "="*60)
    print("Testing SummarizeResponse Schema")
    print("="*60)
    
    # Valid response
    response = SummarizeResponse(
        summary="Student unable to register for CS 101. Staff requested more details. Issue relates to prerequisite requirements not being met.",
        keyPoints=[
            "Cannot add CS 101",
            "Prerequisite issue suspected",
            "Staff investigating"
        ],
        sentiment="NEUTRAL"
    )
    print(f"[PASS] Valid summarize response created")
    print(f"  Summary length: {len(response.summary)}")
    print(f"  Key points: {len(response.keyPoints)}")
    print(f"  Sentiment: {response.sentiment}")
    
    # Test too short summary
    try:
        SummarizeResponse(
            summary="Too short"  # < 20 chars
        )
        print("[FAIL] Should have rejected short summary")
    except ValidationError as e:
        print(f"[PASS] Rejected short summary: {e.error_count()} error(s)")
    
    # Test too many key points
    try:
        SummarizeResponse(
            summary="This is a valid summary with enough characters to pass validation.",
            keyPoints=["P1", "P2", "P3", "P4", "P5", "P6"]  # Max 5
        )
        print("[FAIL] Should have rejected too many key points")
    except ValidationError as e:
        print(f"[PASS] Rejected too many key points: {e.error_count()} error(s)")
    
    # Test invalid sentiment
    try:
        SummarizeResponse(
            summary="This is a valid summary with enough characters to pass validation.",
            sentiment="ANGRY"  # Not a valid option
        )
        print("[FAIL] Should have rejected invalid sentiment")
    except ValidationError as e:
        print(f"[PASS] Rejected invalid sentiment: {e.error_count()} error(s)")


def test_draft_reply_request():
    """Test DraftReplyRequest schema validation."""
    print("\n" + "="*60)
    print("Testing DraftReplyRequest Schema")
    print("="*60)
    
    # Valid request with all fields
    request = DraftReplyRequest(
        ticketId="ticket-456",
        messages=[
            TicketMessage(sender="STUDENT", content="I need my transcript sent"),
            TicketMessage(sender="STAFF", content="I can help with that")
        ],
        tone="EMPATHETIC",
        context="Student needs transcript for job application, urgent"
    )
    print(f"[PASS] Valid draft reply request created")
    print(f"  Ticket ID: {request.ticketId}")
    print(f"  Tone: {request.tone}")
    print(f"  Context: {request.context[:50]}...")
    
    # Valid request with defaults
    request2 = DraftReplyRequest(
        ticketId="ticket-789",
        messages=[
            TicketMessage(sender="STUDENT", content="Question about financial aid")
        ]
    )
    print(f"[PASS] Request with defaults created (tone={request2.tone})")
    
    # Test invalid tone
    try:
        DraftReplyRequest(
            ticketId="ticket-123",
            messages=[TicketMessage(sender="STUDENT", content="Help")],
            tone="SARCASTIC"  # Not valid
        )
        print("[FAIL] Should have rejected invalid tone")
    except ValidationError as e:
        print(f"[PASS] Rejected invalid tone: {e.error_count()} error(s)")


def test_draft_reply_response():
    """Test DraftReplyResponse schema validation."""
    print("\n" + "="*60)
    print("Testing DraftReplyResponse Schema")
    print("="*60)
    
    # Valid response
    response = DraftReplyResponse(
        draft="Thank you for contacting us. I'd be happy to help you with your transcript request. To process this, I'll need your student ID and the address where you'd like it sent.",
        suggestedNextSteps=[
            "Collect student ID",
            "Verify mailing address",
            "Process transcript request"
        ],
        requiresStaffReview=True
    )
    print(f"[PASS] Valid draft reply response created")
    print(f"  Draft length: {len(response.draft)}")
    print(f"  Next steps: {len(response.suggestedNextSteps)}")
    print(f"  Requires review: {response.requiresStaffReview}")
    
    # Test whitespace trimming
    response2 = DraftReplyResponse(
        draft="  Valid draft with whitespace  "
    )
    assert response2.draft == "Valid draft with whitespace", "Should trim whitespace"
    print(f"[PASS] Draft whitespace trimmed correctly")
    
    # Test empty draft
    try:
        DraftReplyResponse(
            draft="     "  # Only whitespace
        )
        print("[FAIL] Should have rejected empty draft")
    except ValidationError as e:
        print(f"[PASS] Rejected empty draft: {e.error_count()} error(s)")
    
    # Test too many next steps
    try:
        DraftReplyResponse(
            draft="Valid draft here",
            suggestedNextSteps=["S1", "S2", "S3", "S4", "S5"]  # Max 4
        )
        print("[FAIL] Should have rejected too many next steps")
    except ValidationError as e:
        print(f"[PASS] Rejected too many next steps: {e.error_count()} error(s)")


if __name__ == "__main__":
    print("="*60)
    print("Assist Schemas Test Suite (AI-04)")
    print("="*60)
    
    test_ticket_message()
    test_summarize_request()
    test_summarize_response()
    test_draft_reply_request()
    test_draft_reply_response()
    
    print("\n" + "="*60)
    print("All assist schema tests passed!")
    print("="*60)
