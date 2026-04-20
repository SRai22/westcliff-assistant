# PA4-03: Security & Governance Section

**Parent:** PA4 — Phase 3: Project Design
**Target length:** 2–3 pages
**Priority:** Critical — professor explicitly asked for governance

---

## What to Write

**Section 3.3 — Security Architecture & Governance**

### Content

1. **Authentication — Google OAuth 2.0:**
   - Students and staff sign in via Google using institutional `@westcliff.edu` accounts
   - Backend verifies Google ID tokens directly (no Passport.js — simpler, fewer dependencies)
   - `express-session` manages server-side sessions after token verification
   - Session invalidation on logout; no client-side token storage

2. **Authorization — Role-Based Access Control (RBAC):**
   - Two roles: `STUDENT` and `STAFF`
   - Enforced in Express middleware (`requireAuth`, `requireStaff`), NOT in frontend UI
   - Students see only their own tickets (`createdBy` filter applied in the query layer)
   - Staff see all tickets, can change status, assign, add internal notes
   - Internal notes (`isInternal: true`) are invisible to students at the API level

3. **FERPA Compliance Design:**
   - Student education records stay in institutional MongoDB — no third-party vendor stores student PII
   - AI service receives only the issue description text — no student name, ID, or email
   - AI service has no database access; cannot query or store student records
   - Audit trail provides accountability: every access and action is logged
   - Data classification: student identity = confidential; ticket content = internal; KB articles = public

4. **Audit Trail:**
   - `StatusHistory` — immutable log of every ticket status change (who, when, from/to)
   - `AuditLog` — broader action log (ticket creation, AI calls, message sends, assignment changes)
   - AI-generated content is labeled and requires staff approval before becoming visible to students (non-ratified output)
   - Supports institutional reporting and compliance documentation

5. **Threat Model (STRIDE):**

   | Threat | Risk | Mitigation |
   |--------|------|------------|
   | **Spoofing** | Attacker impersonates a student | Google OAuth — only verified `@westcliff.edu` tokens accepted; no local passwords |
   | **Tampering** | Unauthorized ticket modification | Backend-enforced RBAC; all mutations go through middleware; status changes are immutable history |
   | **Repudiation** | Staff denies approving a change | AuditLog records every action with userId and timestamp |
   | **Information Disclosure** | Student A sees Student B's tickets | Row-level filtering: `createdBy === currentUser` enforced in DB queries, not UI |
   | **Denial of Service** | Flood of AI intake requests | Rate limiting on AI proxy endpoints; AI service is stateless and horizontally scalable |
   | **Elevation of Privilege** | Student accesses admin dashboard | `requireStaff` middleware blocks all staff-only routes; role checked on every request |

6. **Residual Security Risks** (tie back to PA3's residual risk theme):
   - Social engineering against Google accounts — mitigated by Google's own MFA but not eliminated
   - LLM prompt injection in student intake — mitigated by guardrails module (refusal detection, PII stripping, schema validation) but adversarial inputs remain a residual risk
   - Session fixation — mitigated by `express-session` defaults but requires proper cookie configuration in production

### Artifacts Needed
- [ ] STRIDE table (label as **Table X**)
- [ ] Consider a data flow diagram showing PII boundaries (what crosses the AI service boundary vs. what doesn't)

### Source Files to Reference
- `backend/src/middleware/auth.ts` — requireAuth, requireStaff
- `backend/src/routes/auth.ts` — Google token verification
- `ai/src/guardrails/` — PII stripping, refusal detection
