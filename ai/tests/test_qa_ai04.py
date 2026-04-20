"""
Comprehensive QA tests for AI-04 acceptance criteria.

Verifies all schemas work with valid data, reject invalid data with clear errors,
and that all 11 categories are accepted.
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
from src.schemas.assist import (
    TicketMessage,
    SummarizeRequest,
    SummarizeResponse,
    DraftReplyRequest,
    DraftReplyResponse
)


def qa_step_1_valid_data():
    """QA Step 1: Instantiate each schema with valid data — confirm it passes."""
    print("\n" + "="*60)
    print("QA Step 1: Test all schemas with valid data")
    print("="*60)
    
    schemas_tested = []
    
    # IntakeTriageRequest
    try:
        IntakeTriageRequest(
            text="I need help with course registration for Spring 2026",
            userContext={"role": "student"}
        )
        schemas_tested.append("IntakeTriageRequest")
    except Exception as e:
        print(f"[FAIL] IntakeTriageRequest: {e}")
        return False
    
    # IntakeTriageResponse
    try:
        IntakeTriageResponse(
            category="Registrar",
            service="Course Registration",
            clarifyingQuestions=["Which course?", "What issue occurred?"],
            suggestedArticleIds=["art-101"],
            ticketDraft=TicketDraft(
                summary="Course registration help needed",
                description="Student needs assistance with registering for a course.",
                priority="MEDIUM"
            ),
            confidence=0.78,
            handoffRecommendation="ARTICLE_FIRST"
        )
        schemas_tested.append("IntakeTriageResponse")
    except Exception as e:
        print(f"[FAIL] IntakeTriageResponse: {e}")
        return False
    
    # IntakeFollowupRequest
    try:
        triage = IntakeTriageResponse(
            category="Registrar",
            service="Test",
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description here",
                priority="LOW"
            ),
            confidence=0.5,
            handoffRecommendation="CREATE_TICKET"
        )
        IntakeFollowupRequest(
            triageResult=triage,
            answers=["CS 101", "The system says I don't have prerequisites"]
        )
        schemas_tested.append("IntakeFollowupRequest")
    except Exception as e:
        print(f"[FAIL] IntakeFollowupRequest: {e}")
        return False
    
    # IntakeFollowupResponse
    try:
        IntakeFollowupResponse(
            category="Registrar",
            service="Course Registration",
            ticketDraft=TicketDraft(
                summary="CS 101 registration blocked",
                description="Student trying to register for CS 101 but blocked due to missing prerequisites.",
                priority="HIGH"
            ),
            confidence=0.92,
            additionalContext="Student completed prerequisites at another institution"
        )
        schemas_tested.append("IntakeFollowupResponse")
    except Exception as e:
        print(f"[FAIL] IntakeFollowupResponse: {e}")
        return False
    
    # SummarizeRequest
    try:
        SummarizeRequest(
            ticketId="ticket-123",
            messages=[
                TicketMessage(sender="STUDENT", content="I have a question"),
                TicketMessage(sender="STAFF", content="How can I help?")
            ]
        )
        schemas_tested.append("SummarizeRequest")
    except Exception as e:
        print(f"[FAIL] SummarizeRequest: {e}")
        return False
    
    # SummarizeResponse
    try:
        SummarizeResponse(
            summary="Student asked a question, staff offered to help, issue is still being discussed.",
            keyPoints=["Initial inquiry", "Staff engaged"],
            sentiment="NEUTRAL"
        )
        schemas_tested.append("SummarizeResponse")
    except Exception as e:
        print(f"[FAIL] SummarizeResponse: {e}")
        return False
    
    # DraftReplyRequest
    try:
        DraftReplyRequest(
            ticketId="ticket-456",
            messages=[
                TicketMessage(sender="STUDENT", content="Need transcript")
            ],
            tone="FRIENDLY",
            context="Urgent request for job application"
        )
        schemas_tested.append("DraftReplyRequest")
    except Exception as e:
        print(f"[FAIL] DraftReplyRequest: {e}")
        return False
    
    # DraftReplyResponse
    try:
        DraftReplyResponse(
            draft="I'd be happy to help you with your transcript request. Please provide your student ID.",
            suggestedNextSteps=["Collect student ID", "Process request"],
            requiresStaffReview=True
        )
        schemas_tested.append("DraftReplyResponse")
    except Exception as e:
        print(f"[FAIL] DraftReplyResponse: {e}")
        return False
    
    print(f"[PASS] All {len(schemas_tested)} schemas created successfully with valid data:")
    for schema in schemas_tested:
        print(f"  - {schema}")
    
    return True


def qa_step_2_invalid_data():
    """QA Step 2: Try invalid category or confidence > 1 — confirm ValidationError."""
    print("\n" + "="*60)
    print("QA Step 2: Test invalid data raises ValidationError")
    print("="*60)
    
    tests_passed = []
    
    # Test invalid category
    print("\n[TEST] Invalid category...")
    try:
        IntakeTriageResponse(
            category="Invalid Department",  # Not in VALID_CATEGORIES
            service="Test",
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description",
                priority="LOW"
            ),
            confidence=0.5,
            handoffRecommendation="CREATE_TICKET"
        )
        print("[FAIL] Should have raised ValidationError for invalid category")
        return False
    except ValidationError as e:
        print(f"[PASS] Raised ValidationError: {e.error_count()} error(s)")
        error_msg = str(e.errors()[0]['msg'])
        print(f"  Error message: {error_msg[:100]}...")
        tests_passed.append("Invalid category rejected")
    
    # Test confidence > 1
    print("\n[TEST] Confidence > 1...")
    try:
        IntakeTriageResponse(
            category="Information Technology",
            service="Test",
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description",
                priority="LOW"
            ),
            confidence=1.5,  # Invalid: > 1.0
            handoffRecommendation="CREATE_TICKET"
        )
        print("[FAIL] Should have raised ValidationError for confidence > 1")
        return False
    except ValidationError as e:
        print(f"[PASS] Raised ValidationError: {e.error_count()} error(s)")
        error_msg = str(e.errors()[0]['msg'])
        print(f"  Error message: {error_msg}")
        tests_passed.append("Confidence > 1 rejected")
    
    # Test confidence < 0
    print("\n[TEST] Confidence < 0...")
    try:
        IntakeTriageResponse(
            category="Information Technology",
            service="Test",
            ticketDraft=TicketDraft(
                summary="Test summary",
                description="Test description",
                priority="LOW"
            ),
            confidence=-0.1,  # Invalid: < 0.0
            handoffRecommendation="CREATE_TICKET"
        )
        print("[FAIL] Should have raised ValidationError for confidence < 0")
        return False
    except ValidationError as e:
        print(f"[PASS] Raised ValidationError: {e.error_count()} error(s)")
        tests_passed.append("Confidence < 0 rejected")
    
    print(f"\n[PASS] All {len(tests_passed)} invalid data tests passed:")
    for test in tests_passed:
        print(f"  - {test}")
    
    return True


def qa_step_3_all_categories():
    """QA Step 3: Verify all 11 categories are accepted."""
    print("\n" + "="*60)
    print("QA Step 3: Verify all 11 categories are accepted")
    print("="*60)
    
    print(f"\n[TEST] Testing {len(VALID_CATEGORIES)} categories...")
    
    for i, category in enumerate(VALID_CATEGORIES, 1):
        try:
            response = IntakeTriageResponse(
                category=category,
                service="Test Service",
                ticketDraft=TicketDraft(
                    summary="Test summary",
                    description="Test description",
                    priority="LOW"
                ),
                confidence=0.8,
                handoffRecommendation="CREATE_TICKET"
            )
            print(f"  {i}. [PASS] {category}")
        except ValidationError as e:
            print(f"  {i}. [FAIL] {category}: {e}")
            return False
    
    print(f"\n[PASS] All {len(VALID_CATEGORIES)} categories accepted successfully")
    
    # List all categories for verification
    print("\nComplete category list:")
    for cat in VALID_CATEGORIES:
        print(f"  - {cat}")
    
    return True


if __name__ == "__main__":
    print("="*60)
    print("AI-04 QA Test Suite")
    print("="*60)
    print("\nRunning acceptance criteria tests...")
    
    # Run all QA steps
    step1 = qa_step_1_valid_data()
    step2 = qa_step_2_invalid_data()
    step3 = qa_step_3_all_categories()
    
    # Summary
    print("\n" + "="*60)
    print("QA Test Summary")
    print("="*60)
    print(f"QA Step 1 (Valid data): {'PASS' if step1 else 'FAIL'}")
    print(f"QA Step 2 (Invalid data): {'PASS' if step2 else 'FAIL'}")
    print(f"QA Step 3 (All categories): {'PASS' if step3 else 'FAIL'}")
    
    if step1 and step2 and step3:
        print("\n" + "="*60)
        print("ALL QA ACCEPTANCE CRITERIA MET!")
        print("="*60)
        sys.exit(0)
    else:
        print("\nSome tests failed!")
        sys.exit(1)
