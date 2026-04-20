# PA4-01: Solution Architecture Section

**Parent:** PA4 — Phase 3: Project Design
**Target length:** 1.5–2 pages
**Priority:** High — sets the frame for every other section

---

## What to Write

**Section 3.1 — Solution Architecture**

### Content

1. **Architecture diagram** — 3-service logical diagram:
   - React SPA (Vite, TypeScript) — presentation layer
   - Express API (TypeScript, MongoDB via Mongoose) — application/data layer, sole API gateway
   - FastAPI AI Service (Python) — isolated AI processing, no DB access
   - MongoDB — persistent data store
   - Show: Browser → Express → MongoDB, Express → AI Service

2. **Why this decomposition:**
   - Single API gateway enforces all auth/RBAC — frontend never talks to AI directly
   - AI service isolation: can swap LLM providers without touching the rest of the stack
   - Separation of concerns: each service has one job
   - Docker Compose orchestrates all services for reproducible deployment

3. **Data flow walkthrough — AI Intake:**
   - Student describes issue in plain language
   - Backend proxies to AI `/intake/triage` → returns category, clarifying questions, suggested articles
   - Student answers questions → backend sends to AI `/intake/followup`
   - Student reviews pre-filled ticket draft → confirms → backend writes to MongoDB
   - All AI output is non-ratified (staff must review before sending to student)

4. **Data flow walkthrough — Staff Assist:**
   - Staff opens ticket → clicks Summarize / Draft Reply / Suggest Steps
   - Backend proxies to AI `/assist/*` endpoints
   - AI response displayed with "AI-generated" label
   - Staff edits and approves before any action

### Artifacts Needed
- [ ] Architecture diagram (draw.io, Mermaid, or clean box-and-arrow)
- [ ] Label as **Figure 1** with APA caption

### References Back
- Connect to PA3's recommendation: "consistent with the AI-native architecture validated by Liu et al. (2025)"
- Reference the EDUCAUSE finding that enterprise platforms lack intelligent intake (Czechowski et al., 2024)
