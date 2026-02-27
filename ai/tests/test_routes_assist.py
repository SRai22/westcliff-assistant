"""
Tests for the staff assist routes (AI-09).

Covers POST /assist/summarize and POST /assist/draft-reply using FastAPI's
TestClient with a mocked LLM so no API keys are required.

Test classes:
  TestFormatHelpers       - unit tests for private helper functions
  TestAssistSummarize     - HTTP-level tests for POST /assist/summarize
  TestAssistSummarize422  - request validation (422) tests
  TestAssistDraftReply    - HTTP-level tests for POST /assist/draft-reply
  TestAssistDraftReply422 - request validation (422) tests
"""
import sys
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.routes.assist import router as assist_router
from src.schemas.assist import (
    DraftReplyResponse,
    SummarizeResponse,
    TicketMessage,
)

# ---------------------------------------------------------------------------
# Test app — minimal FastAPI with no lifespan so no API-key checks run
# ---------------------------------------------------------------------------

_test_app = FastAPI()
_test_app.include_router(assist_router)

client = TestClient(_test_app, raise_server_exceptions=True)

# ---------------------------------------------------------------------------
# Shared fixtures / factories
# ---------------------------------------------------------------------------

def _msgs(*pairs: tuple[str, str]) -> list[dict]:
    """Build a messages list from (sender, content) tuples."""
    return [{"sender": s, "content": c} for s, c in pairs]


def _default_messages() -> list[dict]:
    return _msgs(
        ("STUDENT", "I cannot log into Canvas. My password reset is not working."),
        ("STAFF", "Have you tried clearing your browser cache and cookies?"),
        ("STUDENT", "Yes I tried that. Still getting an error: 'Invalid credentials'."),
    )


def _valid_summarize_response() -> SummarizeResponse:
    return SummarizeResponse(
        summary=(
            "Student is unable to log into Canvas after attempting a password reset. "
            "Clearing browser cache did not resolve the issue. Error message: 'Invalid credentials'."
        ),
        keyPoints=[
            "Login failure on Canvas",
            "Password reset not resolving issue",
            "Error: Invalid credentials",
        ],
        sentiment="NEGATIVE",
    )


def _valid_draft_reply_response() -> DraftReplyResponse:
    return DraftReplyResponse(
        draft=(
            "Dear Student,\n\n"
            "Thank you for reaching out to Westcliff University IT Support. "
            "We understand you are experiencing login issues with Canvas. "
            "Please contact the IT Help Desk directly so we can reset your credentials. "
            "\n\nBest regards,\nWestcliff IT Support"
        ),
        suggestedNextSteps=[
            "Escalate to Canvas admin if credential reset fails",
            "Check for account lock-out in system",
        ],
        requiresStaffReview=True,
    )


def _summarize_payload(**overrides) -> dict:
    base = {"ticketId": "ticket-001", "messages": _default_messages()}
    base.update(overrides)
    return base


def _draft_reply_payload(**overrides) -> dict:
    base = {
        "ticketId": "ticket-001",
        "messages": _default_messages(),
        "tone": "PROFESSIONAL",
    }
    base.update(overrides)
    return base


# ---------------------------------------------------------------------------
# Helper function unit tests
# ---------------------------------------------------------------------------

class TestFormatHelpers:
    """Unit tests for private helper functions in assist.py."""

    def test_format_messages_basic(self):
        """Messages are formatted as [SENDER]: content lines."""
        from src.routes.assist import _format_messages

        messages = [
            TicketMessage(sender="STUDENT", content="I need help"),
            TicketMessage(sender="STAFF", content="How can I assist?"),
        ]
        result = _format_messages(messages)

        assert "[STUDENT]: I need help" in result
        assert "[STAFF]: How can I assist?" in result

    def test_format_messages_includes_timestamp(self):
        """Timestamps are included in brackets when present."""
        from src.routes.assist import _format_messages

        messages = [
            TicketMessage(
                sender="STUDENT",
                content="Hello",
                timestamp="2026-02-26T10:00:00Z",
            )
        ]
        result = _format_messages(messages)

        assert "[2026-02-26T10:00:00Z]" in result
        assert "[STUDENT]" in result
        assert "Hello" in result

    def test_format_messages_no_timestamp(self):
        """No timestamp → no timestamp bracket in output."""
        from src.routes.assist import _format_messages

        messages = [TicketMessage(sender="STAFF", content="Test")]
        result = _format_messages(messages)

        assert "[STAFF]: Test" in result
        assert "None" not in result

    def test_format_messages_preserves_order(self):
        """Messages appear in the order provided."""
        from src.routes.assist import _format_messages

        messages = [
            TicketMessage(sender="STUDENT", content="First message"),
            TicketMessage(sender="STAFF", content="Second message"),
            TicketMessage(sender="STUDENT", content="Third message"),
        ]
        result = _format_messages(messages)
        lines = result.splitlines()

        assert any("First message" in l for l in lines)
        first_idx = next(i for i, l in enumerate(lines) if "First message" in l)
        third_idx = next(i for i, l in enumerate(lines) if "Third message" in l)
        assert first_idx < third_idx

    def test_build_additional_context_section_with_context(self):
        """Non-empty context is wrapped in <additional_context> tags."""
        from src.routes.assist import _build_additional_context_section

        result = _build_additional_context_section("Student is very frustrated")

        assert "<additional_context>" in result
        assert "Student is very frustrated" in result
        assert "</additional_context>" in result

    def test_build_additional_context_section_none(self):
        """None context returns empty string."""
        from src.routes.assist import _build_additional_context_section

        assert _build_additional_context_section(None) == ""

    def test_build_additional_context_section_empty_string(self):
        """Empty string context returns empty string."""
        from src.routes.assist import _build_additional_context_section

        assert _build_additional_context_section("") == ""


# ---------------------------------------------------------------------------
# POST /assist/summarize — happy path
# ---------------------------------------------------------------------------

class TestAssistSummarize:
    """HTTP-level tests for POST /assist/summarize."""

    def test_happy_path_returns_200_and_schema(self):
        """Valid request with successful LLM call returns 200 and full schema."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_summarize_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/summarize", json=_summarize_payload())

        assert resp.status_code == 200
        data = resp.json()
        assert "summary" in data
        assert isinstance(data["keyPoints"], list)
        assert data["sentiment"] == "NEGATIVE"

    def test_llm_called_once_on_success(self):
        """LLM is called exactly once when first attempt succeeds."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_summarize_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            client.post("/assist/summarize", json=_summarize_payload())

        mock_llm.complete.assert_called_once()

    def test_all_sentiment_values_accepted(self):
        """Each valid sentiment value is returned correctly."""
        for sentiment in ("POSITIVE", "NEUTRAL", "NEGATIVE", "URGENT"):
            mock_resp = SummarizeResponse(
                summary="A" * 30,
                keyPoints=["Point one"],
                sentiment=sentiment,
            )
            mock_llm = AsyncMock()
            mock_llm.complete = AsyncMock(return_value=mock_resp)

            with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
                resp = client.post("/assist/summarize", json=_summarize_payload())

            assert resp.status_code == 200
            assert resp.json()["sentiment"] == sentiment

    def test_null_sentiment_accepted(self):
        """Null sentiment is accepted when LLM returns None."""
        mock_resp = SummarizeResponse(
            summary="Conversation summary for the ticket.",
            keyPoints=[],
            sentiment=None,
        )
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=mock_resp)

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/summarize", json=_summarize_payload())

        assert resp.status_code == 200
        assert resp.json()["sentiment"] is None

    def test_llm_exception_returns_fallback(self):
        """LLM raising exception on every attempt returns fallback after MAX_RETRIES."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(side_effect=RuntimeError("LLM unavailable"))

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/summarize", json=_summarize_payload())

        assert resp.status_code == 200
        data = resp.json()
        assert "ticket-001" in data["summary"]
        assert mock_llm.complete.call_count == 3  # MAX_RETRIES

    def test_guardrail_failure_retries_then_falls_back(self):
        """If validate_output always fails, fallback is returned after retries."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_summarize_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            with patch("src.routes.assist.validate_output", return_value=(False, "bad output")):
                resp = client.post("/assist/summarize", json=_summarize_payload())

        assert resp.status_code == 200
        assert "ticket-001" in resp.json()["summary"]
        assert mock_llm.complete.call_count == 3

    def test_llm_recovers_on_second_attempt(self):
        """LLM failing first then succeeding returns the good response."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(
            side_effect=[RuntimeError("timeout"), _valid_summarize_response()]
        )

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/summarize", json=_summarize_payload())

        assert resp.status_code == 200
        assert mock_llm.complete.call_count == 2

    def test_single_message_accepted(self):
        """A single-message conversation is accepted."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_summarize_response())

        payload = _summarize_payload(messages=_msgs(("STUDENT", "I have a registration issue")))

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/summarize", json=payload)

        assert resp.status_code == 200

    def test_ticket_id_forwarded_to_prompt(self):
        """ticket_id is passed through to the LLM prompt (captured via call args)."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_summarize_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            client.post("/assist/summarize", json=_summarize_payload(ticketId="abc-xyz"))

        call_kwargs = mock_llm.complete.call_args.kwargs
        assert "abc-xyz" in call_kwargs.get("user_prompt", "")


# ---------------------------------------------------------------------------
# POST /assist/summarize — 422 request validation
# ---------------------------------------------------------------------------

class TestAssistSummarize422:
    """Request-validation tests for POST /assist/summarize."""

    def test_missing_ticket_id(self):
        resp = client.post("/assist/summarize", json={"messages": _default_messages()})
        assert resp.status_code == 422

    def test_missing_messages(self):
        resp = client.post("/assist/summarize", json={"ticketId": "t-001"})
        assert resp.status_code == 422

    def test_empty_messages_list(self):
        resp = client.post("/assist/summarize", json={"ticketId": "t-001", "messages": []})
        assert resp.status_code == 422

    def test_invalid_sender_value(self):
        resp = client.post(
            "/assist/summarize",
            json={
                "ticketId": "t-001",
                "messages": [{"sender": "ADMIN", "content": "Hello"}],
            },
        )
        assert resp.status_code == 422

    def test_empty_message_content(self):
        resp = client.post(
            "/assist/summarize",
            json={
                "ticketId": "t-001",
                "messages": [{"sender": "STUDENT", "content": ""}],
            },
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# POST /assist/draft-reply — happy path
# ---------------------------------------------------------------------------

class TestAssistDraftReply:
    """HTTP-level tests for POST /assist/draft-reply."""

    def test_happy_path_returns_200_and_schema(self):
        """Valid request with successful LLM call returns 200 and full schema."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_draft_reply_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/draft-reply", json=_draft_reply_payload())

        assert resp.status_code == 200
        data = resp.json()
        assert "draft" in data
        assert isinstance(data["suggestedNextSteps"], list)
        assert data["requiresStaffReview"] is True

    def test_requires_staff_review_always_true(self):
        """requiresStaffReview is always True regardless of LLM output."""
        bad_resp = DraftReplyResponse(
            draft="Thank you for contacting student services.",
            suggestedNextSteps=[],
            requiresStaffReview=False,  # LLM returned False!
        )
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=bad_resp)

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/draft-reply", json=_draft_reply_payload())

        assert resp.status_code == 200
        assert resp.json()["requiresStaffReview"] is True

    def test_all_tone_values_accepted(self):
        """Each valid tone is forwarded to the LLM."""
        for tone in ("PROFESSIONAL", "FRIENDLY", "EMPATHETIC", "CONCISE"):
            mock_llm = AsyncMock()
            mock_llm.complete = AsyncMock(return_value=_valid_draft_reply_response())

            with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
                resp = client.post(
                    "/assist/draft-reply", json=_draft_reply_payload(tone=tone)
                )

            assert resp.status_code == 200
            call_kwargs = mock_llm.complete.call_args.kwargs
            assert tone in call_kwargs.get("user_prompt", "")

    def test_default_tone_is_professional(self):
        """Omitting tone defaults to PROFESSIONAL in the prompt."""
        payload = {k: v for k, v in _draft_reply_payload().items() if k != "tone"}
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_draft_reply_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/draft-reply", json=payload)

        assert resp.status_code == 200
        call_kwargs = mock_llm.complete.call_args.kwargs
        assert "PROFESSIONAL" in call_kwargs.get("user_prompt", "")

    def test_optional_context_included_in_prompt(self):
        """Optional context is forwarded to the LLM prompt."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_draft_reply_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post(
                "/assist/draft-reply",
                json=_draft_reply_payload(context="Student is a veteran on GI Bill"),
            )

        assert resp.status_code == 200
        call_kwargs = mock_llm.complete.call_args.kwargs
        assert "Student is a veteran on GI Bill" in call_kwargs.get("user_prompt", "")

    def test_no_context_does_not_inject_section(self):
        """Omitting optional context does not leave a raw placeholder in the prompt."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_draft_reply_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/draft-reply", json=_draft_reply_payload())

        assert resp.status_code == 200
        call_kwargs = mock_llm.complete.call_args.kwargs
        assert "{additional_context_section}" not in call_kwargs.get("user_prompt", "")

    def test_llm_exception_returns_fallback(self):
        """LLM failure returns fallback with requiresStaffReview=True."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(side_effect=RuntimeError("LLM unavailable"))

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/draft-reply", json=_draft_reply_payload())

        assert resp.status_code == 200
        data = resp.json()
        assert data["requiresStaffReview"] is True
        assert len(data["draft"]) > 0
        assert mock_llm.complete.call_count == 3  # MAX_RETRIES

    def test_guardrail_failure_retries_then_falls_back(self):
        """validate_output always failing triggers fallback after MAX_RETRIES."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_draft_reply_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            with patch("src.routes.assist.validate_output", return_value=(False, "bad")):
                resp = client.post("/assist/draft-reply", json=_draft_reply_payload())

        assert resp.status_code == 200
        assert resp.json()["requiresStaffReview"] is True
        assert mock_llm.complete.call_count == 3

    def test_llm_recovers_on_second_attempt(self):
        """LLM failing first then succeeding returns the good response."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(
            side_effect=[RuntimeError("timeout"), _valid_draft_reply_response()]
        )

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            resp = client.post("/assist/draft-reply", json=_draft_reply_payload())

        assert resp.status_code == 200
        assert mock_llm.complete.call_count == 2

    def test_ticket_id_forwarded_to_prompt(self):
        """ticket_id is present in the LLM user prompt."""
        mock_llm = AsyncMock()
        mock_llm.complete = AsyncMock(return_value=_valid_draft_reply_response())

        with patch("src.routes.assist.get_llm_client", return_value=mock_llm):
            client.post(
                "/assist/draft-reply", json=_draft_reply_payload(ticketId="xyz-789")
            )

        call_kwargs = mock_llm.complete.call_args.kwargs
        assert "xyz-789" in call_kwargs.get("user_prompt", "")


# ---------------------------------------------------------------------------
# POST /assist/draft-reply — 422 request validation
# ---------------------------------------------------------------------------

class TestAssistDraftReply422:
    """Request-validation tests for POST /assist/draft-reply."""

    def test_missing_ticket_id(self):
        resp = client.post("/assist/draft-reply", json={"messages": _default_messages()})
        assert resp.status_code == 422

    def test_missing_messages(self):
        resp = client.post("/assist/draft-reply", json={"ticketId": "t-001"})
        assert resp.status_code == 422

    def test_empty_messages_list(self):
        resp = client.post(
            "/assist/draft-reply", json={"ticketId": "t-001", "messages": []}
        )
        assert resp.status_code == 422

    def test_invalid_tone_value(self):
        resp = client.post(
            "/assist/draft-reply",
            json={
                "ticketId": "t-001",
                "messages": _default_messages(),
                "tone": "AGGRESSIVE",
            },
        )
        assert resp.status_code == 422

    def test_context_too_long(self):
        resp = client.post(
            "/assist/draft-reply",
            json={
                "ticketId": "t-001",
                "messages": _default_messages(),
                "context": "x" * 501,  # max is 500
            },
        )
        assert resp.status_code == 422

    def test_invalid_sender_value(self):
        resp = client.post(
            "/assist/draft-reply",
            json={
                "ticketId": "t-001",
                "messages": [{"sender": "BOT", "content": "Hello"}],
            },
        )
        assert resp.status_code == 422
