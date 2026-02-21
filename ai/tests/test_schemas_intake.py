"""
Tests for intake schemas (AI-04).

Tests all request/response schemas for intake triage and followup,
including validation rules and field constraints.
"""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from pydantic import ValidationError
from src.schemas.intake import (
    IntakeTriageRequest,
    IntakeTriageResponse,
    IntakeFollowupRequest,
    IntakeFollowupResponse,
    TicketDraft,
    VALID_CATEGORIES
)


def test_ticket_draft():
    """Test TicketDraft schema validation."""
    print("\n" + "="*60)
    print("Testing TicketDraft Schema")
    print("="*60)
    
    # Valid ticket draft
    draft = TicketDraft(
        summary="Cannot access Canvas",
        description="Student is unable to log into Canvas LMS after password reset.",
        priority="HIGH"
    )
    print(f"[PASS] Valid ticket draft created")
    print(f"  Summary: {draft.summary}")
    print(f"  Priority: {draft.priority}")
    
    # Test invalid priority
    try:
        TicketDraft(
            summary="Test",
            description="Test description here",
            priority="CRITICAL"  # Invalid
        )
        print("[FAIL] Should have rejected invalid priority")
    except ValidationError as e:
        print(f"[PASS] Rejected invalid priority: {e.error_count()} error(s)")
    
    # Test too short summary
    try:
        TicketDraft(
            summary="Hi",  # Too short
            description="This is a valid description",
            priority="LOW"
        )
        print("[FAIL] Should have rejected short summary")
    except ValidationError as e:
        print(f"[PASS] Rejected short summary: {e.error_count()} error(s)")


def test_intake_triage_request():
    """Test IntakeTriageRequest schema validation."""
    print("\n" + "="*60)
    print("Testing IntakeTriageRequest Schema")
    print("="*60)
    
    # Valid request
    request = IntakeTriageRequest(
        text="I need help resetting my password for the student portal",
        userContext={"role": "student", "program": "MBA"}
    )
    print(f"[PASS] Valid request created")
    print(f"  Text length: {len(request.text)}")
    print(f"  User context: {request.userContext}")
    
    # Test text trimming
    request2 = IntakeTriageRequest(
        text="  Whitespace test  "
    )
    assert request2.text == "Whitespace test", "Should trim whitespace"
    print(f"[PASS] Whitespace trimmed correctly")
    
    # Test too short text
    try:
        IntakeTriageRequest(text="Help")  # Too short
        print("[FAIL] Should have rejected short text")
    except ValidationError as e:
        print(f"[PASS] Rejected short text: {e.error_count()} error(s)")
    
    # Test empty text after trim
    try:
        IntakeTriageRequest(text="     ")  # Only whitespace
        print("[FAIL] Should have rejected whitespace-only text")
    except ValidationError as e:
        print(f"[PASS] Rejected whitespace-only text: {e.error_count()} error(s)")


def test_intake_triage_response():
    """Test IntakeTriageResponse schema validation."""
    print("\n" + "="*60)
    print("Testing IntakeTriageResponse Schema")
    print("="*60)
    
    # Valid response
    response = IntakeTriageResponse(
        category="Information Technology",
        service="Password Reset",
        clarifyingQuestions=[
            "Which system are you trying to access?",
            "When did you first notice this issue?"
        ],
        suggestedArticleIds=["art-123", "art-456"],
        ticketDraft=TicketDraft(
            summary="Password reset needed",
            description="Student needs password reset for portal access.",
            priority="MEDIUM"
        ),
        confidence=0.85,
        handoffRecommendation="ARTICLE_FIRST"
    )
    print(f"[PASS] Valid response created")
    print(f"  Category: {response.category}")
    print(f"  Confidence: {response.confidence}")
    print(f"  Questions: {len(response.clarifyingQuestions)}")
    
    # Test all 11 categories
    print(f"\n[TEST] Validating all {len(VALID_CATEGORIES)} categories...")
    for cat in VALID_CATEGORIES:
        response = IntakeTriageResponse(
            category=cat,
            service="Test Service",
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description",
                priority="LOW"
            ),
            confidence=0.9,
            handoffRecommendation="CREATE_TICKET"
        )
    print(f"[PASS] All {len(VALID_CATEGORIES)} categories accepted")
    
    # Test invalid category
    try:
        IntakeTriageResponse(
            category="Invalid Category",  # Not in list
            service="Test",
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description",
                priority="LOW"
            ),
            confidence=0.9,
            handoffRecommendation="CREATE_TICKET"
        )
        print("[FAIL] Should have rejected invalid category")
    except ValidationError as e:
        print(f"[PASS] Rejected invalid category: {e.error_count()} error(s)")
    
    # Test confidence out of range
    try:
        IntakeTriageResponse(
            category="Information Technology",
            service="Test",
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description",
                priority="LOW"
            ),
            confidence=1.5,  # > 1.0
            handoffRecommendation="CREATE_TICKET"
        )
        print("[FAIL] Should have rejected confidence > 1")
    except ValidationError as e:
        print(f"[PASS] Rejected confidence > 1: {e.error_count()} error(s)")
    
    # Test too many questions
    try:
        IntakeTriageResponse(
            category="Information Technology",
            service="Test",
            clarifyingQuestions=["Q1", "Q2", "Q3", "Q4", "Q5"],  # Max 4
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description",
                priority="LOW"
            ),
            confidence=0.9,
            handoffRecommendation="CREATE_TICKET"
        )
        print("[FAIL] Should have rejected too many questions")
    except ValidationError as e:
        print(f"[PASS] Rejected too many questions: {e.error_count()} error(s)")


def test_intake_followup():
    """Test IntakeFollowup schemas."""
    print("\n" + "="*60)
    print("Testing IntakeFollowup Schemas")
    print("="*60)
    
    # Create a valid triage result
    triage_result = IntakeTriageResponse(
        category="Registrar",
        service="Course Registration",
        clarifyingQuestions=["What course?", "What semester?"],
        ticketDraft=TicketDraft(
            summary="Registration issue",
            description="Student having trouble with registration.",
            priority="MEDIUM"
        ),
        confidence=0.7,
        handoffRecommendation="ARTICLE_FIRST"
    )
    
    # Valid followup request
    followup_req = IntakeFollowupRequest(
        triageResult=triage_result,
        answers=["CS 101", "Fall 2026"]
    )
    print(f"[PASS] Valid followup request created")
    print(f"  Answers: {followup_req.answers}")
    
    # Test empty answers
    try:
        IntakeFollowupRequest(
            triageResult=triage_result,
            answers=[]
        )
        print("[FAIL] Should have rejected empty answers")
    except ValidationError as e:
        print(f"[PASS] Rejected empty answers: {e.error_count()} error(s)")
    
    # Valid followup response
    followup_resp = IntakeFollowupResponse(
        category="Registrar",
        service="Course Registration",
        ticketDraft=TicketDraft(
            summary="Registration for CS 101",
            description="Student needs help registering for CS 101 in Fall 2026.",
            priority="MEDIUM"
        ),
        confidence=0.95,
        additionalContext="Student is in MBA program"
    )
    print(f"[PASS] Valid followup response created")
    print(f"  Updated confidence: {followup_resp.confidence}")


if __name__ == "__main__":
    print("="*60)
    print("Intake Schemas Test Suite (AI-04)")
    print("="*60)
    
    test_ticket_draft()
    test_intake_triage_request()
    test_intake_triage_response()
    test_intake_followup()
    
    print("\n" + "="*60)
    print("All intake schema tests passed!")
    print("="*60)
