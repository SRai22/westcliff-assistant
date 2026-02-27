"""
Intake Routes

Handles the AI-assisted intake flow where students describe their issues
and the service triages them into structured support tickets.
"""
import logging

from fastapi import APIRouter

from ..llm.client import get_llm_client
from ..prompts import get_prompt
from ..rules.guardrails import check_refusal, sanitize_for_logging, validate_output
from ..schemas.intake import (
    IntakeFollowupRequest,
    IntakeFollowupResponse,
    IntakeTriageRequest,
    IntakeTriageResponse,
    TicketDraft,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/intake", tags=["intake"])

# Maximum LLM call attempts before falling back
MAX_RETRIES = 3

# Safe fallback returned when the LLM fails or call is refused
_FALLBACK_RESPONSE = IntakeTriageResponse(
    category="Student Services",
    service="General Inquiry",
    clarifyingQuestions=[],
    suggestedArticleIds=[],
    ticketDraft=TicketDraft(
        summary="Student support request requiring staff review",
        description=(
            "A student has submitted a support request. "
            "The automated triage system was unable to classify it at this time. "
            "Please review and route this ticket to the appropriate department."
        ),
        priority="MEDIUM",
    ),
    confidence=0.0,
    handoffRecommendation="CREATE_TICKET",
)


def _build_user_context_section(user_context: dict | None) -> str:
    """Format the optional user context into a prompt section string."""
    if not user_context:
        return ""
    lines = ["<user_context>"]
    for key, value in user_context.items():
        lines.append(f"  {key}: {value}")
    lines.append("</user_context>")
    return "\n".join(lines)


@router.post("/triage", response_model=IntakeTriageResponse)
async def intake_triage(request: IntakeTriageRequest) -> IntakeTriageResponse:
    """
    Triage a student's support request.

    1. Runs refusal / guardrail check on raw input.
    2. Renders the intake_triage prompt template.
    3. Calls the LLM (with retries) requesting a structured IntakeTriageResponse.
    4. Validates the LLM output through guardrails.
    5. Returns the validated response, or a safe fallback on persistent failure.
    """
    sanitized_preview = sanitize_for_logging(request.text[:120])
    logger.info(f"Intake triage request: {sanitized_preview!r}")

    # --- Guardrail: refusal check ------------------------------------------------
    refusal_message = check_refusal(request.text)
    if refusal_message is not None:
        logger.info("Intake triage refused by guardrails — returning fallback")
        return _FALLBACK_RESPONSE

    # --- Prompt rendering -------------------------------------------------------
    template = get_prompt("intake_triage")
    user_context_section = _build_user_context_section(request.userContext)
    user_prompt = template.render_user_prompt(
        text=request.text,
        user_context_section=user_context_section,
    )
    system_prompt = template.render_system_prompt()

    # --- LLM call with retries --------------------------------------------------
    llm = get_llm_client()
    last_error: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response: IntakeTriageResponse = await llm.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                output_schema=IntakeTriageResponse,
            )

            # --- Output guardrail validation ------------------------------------
            is_valid, validation_message = validate_output(response)
            if not is_valid:
                logger.warning(
                    f"Intake triage output failed guardrail validation "
                    f"(attempt {attempt}/{MAX_RETRIES}): {validation_message}"
                )
                last_error = ValueError(validation_message)
                continue

            logger.info(
                f"Intake triage succeeded (attempt {attempt}/{MAX_RETRIES}): "
                f"category={response.category!r}, confidence={response.confidence:.2f}"
            )
            return response

        except Exception as exc:
            logger.warning(
                f"Intake triage LLM call failed "
                f"(attempt {attempt}/{MAX_RETRIES}): {exc}"
            )
            last_error = exc

    # --- Fallback after exhausted retries ---------------------------------------
    logger.error(
        f"Intake triage failed after {MAX_RETRIES} attempt(s), "
        f"returning safe fallback. Last error: {last_error}"
    )
    return _FALLBACK_RESPONSE


def _build_questions_and_answers(questions: list[str], answers: list[str]) -> str:
    """Interleave clarifying questions with student answers for the prompt."""
    pairs = []
    for i, answer in enumerate(answers):
        question = questions[i] if i < len(questions) else f"Question {i + 1}"
        pairs.append(f"Q{i + 1}: {question}\nA{i + 1}: {answer}")
    return "\n\n".join(pairs)


def _followup_fallback(request: IntakeFollowupRequest) -> IntakeFollowupResponse:
    """Safe fallback derived from the original triage when the LLM fails."""
    original = request.triageResult
    return IntakeFollowupResponse(
        category=original.category,
        service=original.service,
        ticketDraft=original.ticketDraft,
        confidence=0.0,
        additionalContext=(
            "Automated refinement was unavailable. "
            "Original triage result preserved for staff review."
        ),
    )


@router.post("/followup", response_model=IntakeFollowupResponse)
async def intake_followup(request: IntakeFollowupRequest) -> IntakeFollowupResponse:
    """
    Refine a ticket draft after the student answers clarifying questions.

    1. Runs refusal / guardrail check on each student answer.
    2. Renders the intake_followup prompt template.
    3. Calls the LLM (with retries) requesting a structured IntakeFollowupResponse.
    4. Validates the LLM output through guardrails.
    5. Returns the validated response, or a safe fallback on persistent failure.
    """
    sanitized_preview = sanitize_for_logging(" | ".join(request.answers)[:120])
    logger.info(f"Intake followup request — answers: {sanitized_preview!r}")

    # --- Guardrail: refusal check on each answer --------------------------------
    for answer in request.answers:
        refusal_message = check_refusal(answer)
        if refusal_message is not None:
            logger.info("Intake followup refused by guardrails — returning fallback")
            return _followup_fallback(request)

    # --- Prompt rendering -------------------------------------------------------
    template = get_prompt("intake_followup")
    original = request.triageResult
    questions_and_answers = _build_questions_and_answers(
        original.clarifyingQuestions, request.answers
    )
    user_prompt = template.render_user_prompt(
        original_category=original.category,
        original_service=original.service,
        original_summary=original.ticketDraft.summary,
        original_description=original.ticketDraft.description,
        original_priority=original.ticketDraft.priority,
        original_confidence=str(original.confidence),
        questions_and_answers=questions_and_answers,
    )
    system_prompt = template.render_system_prompt()

    # --- LLM call with retries --------------------------------------------------
    llm = get_llm_client()
    last_error: Exception | None = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response: IntakeFollowupResponse = await llm.complete(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                output_schema=IntakeFollowupResponse,
            )

            # --- Output guardrail validation ------------------------------------
            is_valid, validation_message = validate_output(response)
            if not is_valid:
                logger.warning(
                    f"Intake followup output failed guardrail validation "
                    f"(attempt {attempt}/{MAX_RETRIES}): {validation_message}"
                )
                last_error = ValueError(validation_message)
                continue

            logger.info(
                f"Intake followup succeeded (attempt {attempt}/{MAX_RETRIES}): "
                f"category={response.category!r}, confidence={response.confidence:.2f}"
            )
            return response

        except Exception as exc:
            logger.warning(
                f"Intake followup LLM call failed "
                f"(attempt {attempt}/{MAX_RETRIES}): {exc}"
            )
            last_error = exc

    # --- Fallback after exhausted retries ---------------------------------------
    logger.error(
        f"Intake followup failed after {MAX_RETRIES} attempt(s), "
        f"returning safe fallback. Last error: {last_error}"
    )
    return _followup_fallback(request)
