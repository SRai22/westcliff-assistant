"""
Staff Assist Routes

AI-powered helpers for staff: ticket conversation summarization and draft reply generation.
All outputs are non-binding and require staff review before use.
"""
import logging

from fastapi import APIRouter

from ..llm.client import get_llm_client
from ..prompts import get_prompt
from ..rules.guardrails import sanitize_for_logging, validate_output
from ..schemas.assist import (
    DraftReplyRequest,
    DraftReplyResponse,
    SummarizeRequest,
    SummarizeResponse,
    TicketMessage,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assist", tags=["assist"])

# Maximum LLM call attempts before falling back
MAX_RETRIES = 3


# =============================================================================
# HELPERS
# =============================================================================

def _format_messages(messages: list[TicketMessage]) -> str:
    """Render ticket messages into a readable transcript for the prompt."""
    lines = []
    for msg in messages:
        ts = f" [{msg.timestamp}]" if msg.timestamp else ""
        lines.append(f"[{msg.sender}]{ts}: {msg.content}")
    return "\n".join(lines)


def _build_additional_context_section(context: str | None) -> str:
    """Format the optional additional context into a prompt section string."""
    if not context:
        return ""
    return f"<additional_context>\n{context}\n</additional_context>"


# =============================================================================
# POST /assist/summarize
# =============================================================================

@router.post("/summarize", response_model=SummarizeResponse)
async def assist_summarize(request: SummarizeRequest) -> SummarizeResponse:
    """
    Summarize a ticket conversation thread for staff review.

    1. Renders the assist_summarize prompt template.
    2. Calls the LLM (with retries) requesting a structured SummarizeResponse.
    3. Validates output through guardrails.
    4. Returns the validated summary, or a safe fallback on persistent failure.
    """
    logger.info(
        f"Assist summarize request — ticketId={request.ticketId!r}, "
        f"messages={len(request.messages)}"
    )

    # --- Prompt rendering -------------------------------------------------------
    template = get_prompt("assist_summarize")
    user_prompt = template.render_user_prompt(
        ticket_id=request.ticketId,
        messages=_format_messages(request.messages),
    )
    system_prompt = template.render_system_prompt()

    # --- LLM call with retries --------------------------------------------------
    llm = get_llm_client()
    last_error: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response: SummarizeResponse = await llm.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                output_schema=SummarizeResponse,
            )

            is_valid, validation_message = validate_output(response)
            if not is_valid:
                logger.warning(
                    f"Assist summarize output failed guardrail validation "
                    f"(attempt {attempt}/{MAX_RETRIES}): {validation_message}"
                )
                last_error = ValueError(validation_message)
                continue

            logger.info(
                f"Assist summarize succeeded (attempt {attempt}/{MAX_RETRIES}): "
                f"ticketId={request.ticketId!r}, sentiment={response.sentiment!r}"
            )
            return response

        except Exception as exc:
            logger.warning(
                f"Assist summarize LLM call failed "
                f"(attempt {attempt}/{MAX_RETRIES}): {exc}"
            )
            last_error = exc

    # --- Fallback after exhausted retries ---------------------------------------
    logger.error(
        f"Assist summarize failed after {MAX_RETRIES} attempt(s), "
        f"returning safe fallback. Last error: {last_error}"
    )
    preview = sanitize_for_logging(request.messages[0].content[:80])
    return SummarizeResponse(
        summary=(
            f"Automated summary unavailable for ticket {request.ticketId}. "
            f"Please review the {len(request.messages)} message(s) directly."
        ),
        keyPoints=[],
        sentiment=None,
    )


# =============================================================================
# POST /assist/draft-reply
# =============================================================================

@router.post("/draft-reply", response_model=DraftReplyResponse)
async def assist_draft_reply(request: DraftReplyRequest) -> DraftReplyResponse:
    """
    Draft a reply to a support ticket for staff review.

    1. Renders the assist_draft_reply prompt template.
    2. Calls the LLM (with retries) requesting a structured DraftReplyResponse.
    3. Validates output through guardrails (requiresStaffReview must be True).
    4. Returns the validated draft, or a safe fallback on persistent failure.
    """
    tone = request.tone or "PROFESSIONAL"
    logger.info(
        f"Assist draft-reply request — ticketId={request.ticketId!r}, "
        f"tone={tone!r}, messages={len(request.messages)}"
    )

    # --- Prompt rendering -------------------------------------------------------
    template = get_prompt("assist_draft_reply")
    user_prompt = template.render_user_prompt(
        ticket_id=request.ticketId,
        tone=tone,
        messages=_format_messages(request.messages),
        additional_context_section=_build_additional_context_section(request.context),
    )
    system_prompt = template.render_system_prompt()

    # --- LLM call with retries --------------------------------------------------
    llm = get_llm_client()
    last_error: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response: DraftReplyResponse = await llm.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                output_schema=DraftReplyResponse,
            )

            # Enforce requiresStaffReview invariant before guardrail check
            if not response.requiresStaffReview:
                logger.warning(
                    f"LLM returned requiresStaffReview=False — overriding to True "
                    f"(attempt {attempt}/{MAX_RETRIES})"
                )
                response = response.model_copy(update={"requiresStaffReview": True})

            is_valid, validation_message = validate_output(response)
            if not is_valid:
                logger.warning(
                    f"Assist draft-reply output failed guardrail validation "
                    f"(attempt {attempt}/{MAX_RETRIES}): {validation_message}"
                )
                last_error = ValueError(validation_message)
                continue

            logger.info(
                f"Assist draft-reply succeeded (attempt {attempt}/{MAX_RETRIES}): "
                f"ticketId={request.ticketId!r}"
            )
            return response

        except Exception as exc:
            logger.warning(
                f"Assist draft-reply LLM call failed "
                f"(attempt {attempt}/{MAX_RETRIES}): {exc}"
            )
            last_error = exc

    # --- Fallback after exhausted retries ---------------------------------------
    logger.error(
        f"Assist draft-reply failed after {MAX_RETRIES} attempt(s), "
        f"returning safe fallback. Last error: {last_error}"
    )
    return DraftReplyResponse(
        draft=(
            "Thank you for contacting Westcliff University Student Services. "
            "We have received your message and a staff member will review your "
            "request and respond shortly."
        ),
        suggestedNextSteps=[
            "Review the ticket conversation in full before sending",
            "Route to the appropriate department if needed",
        ],
        requiresStaffReview=True,
    )
