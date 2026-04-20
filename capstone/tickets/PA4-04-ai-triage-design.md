# PA4-04: AI Triage Design Section

**Parent:** PA4 — Phase 3: Project Design
**Target length:** 1–1.5 pages
**Priority:** High — core differentiator of the system

---

## What to Write

**Section 3.4 — AI-Powered Triage Engine**

### Content

1. **Conversational Intake Flow:**
   - Student describes issue in free text → `POST /intake/triage`
   - AI returns structured JSON: category (1 of 10 departments), confidence score, clarifying questions, suggested KB articles, draft ticket
   - If clarification needed → student answers → `POST /intake/followup` → refined classification
   - Student reviews pre-filled ticket (title, description, category, priority) → confirms → `POST /tickets/intake/confirm` → written to MongoDB
   - This is the "intelligent intake" that enterprise platforms lack (Czechowski et al., 2024)

2. **Staff-Assist AI Tools:**
   - **Summarize** (`/assist/summarize`) — condenses ticket + message history for quick staff review
   - **Draft Reply** (`/assist/draft-reply`) — generates a suggested response based on ticket context
   - **Suggest Next Steps** (`/assist/suggest-steps`) — recommends resolution actions
   - All output labeled as AI-generated; staff must review and approve before sending (non-ratified output rule)

3. **LLM Architecture:**
   - Abstract LLM client interface with factory pattern — supports OpenAI and Google Gemini
   - Provider-agnostic: can swap models without changing business logic
   - YAML prompt templates — version-controlled, auditable, tunable without code changes
   - Pydantic schemas enforce structured JSON output from every AI endpoint

4. **Guardrails Module:**
   - **Refusal detection** — flags when LLM declines to respond or hallucinates
   - **PII stripping** — removes student identifiers before they reach the LLM (defense in depth)
   - **Schema validation** — Pydantic on AI service side, Zod on backend side — double validation boundary
   - **Fallback stubs** — if AI service is unreachable, backend returns graceful degradation (retained from integration phase)

5. **Why this matters (tie to research):**
   - Liu et al. (2025): LLM triage achieved 39% MTTR reduction at production scale
   - Razma & Jurkus (2026): transformer models outperform classifiers on rare categories — exactly Westcliff's low-volume departments (Military/Veterans, Resolution Center)
   - Windiatmoko et al. (2021): fixed-taxonomy ceiling demonstrates why LLM-native is necessary

### Artifacts Needed
- [ ] Consider a sequence diagram or flowchart of the intake conversation (label as **Figure X**)

### Source Files to Reference
- `ai/src/routes/` — intake and assist endpoints
- `ai/src/prompts/` — YAML prompt templates
- `ai/src/guardrails/` — guardrails module
- `ai/src/llm/` — LLM client factory and implementations
- `backend/src/routes/ai.ts` — AI proxy endpoints
