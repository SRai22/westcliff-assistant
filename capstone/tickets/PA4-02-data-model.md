# PA4-02: Data Model Design Section

**Parent:** PA4 — Phase 3: Project Design
**Target length:** 1.5–2 pages
**Priority:** High

---

## What to Write

**Section 3.2 — Data Model Design**

### Content

1. **Entity overview table** — one row per model:

   | Model | Purpose | Key Fields |
   |-------|---------|------------|
   | User | Student/staff identity | googleId, email, role (STUDENT/STAFF), displayName |
   | Ticket | Core work item | title, description, category (10 depts), status, priority, assignedTo, createdBy |
   | Message | Ticket conversation thread | ticketId, senderId, body, isInternal (staff-only notes) |
   | StatusHistory | Immutable status change log | ticketId, fromStatus, toStatus, changedBy, timestamp |
   | AuditLog | Full action audit trail | action, userId, ticketId, metadata, timestamp |
   | Article | Knowledge base entries | title, body, category, tags |

2. **Key relationships and domain rules:**
   - Ticket → User (createdBy, assignedTo) — enforces ownership
   - Ticket → Message[] — one-to-many, ordered by timestamp
   - Every status transition creates a StatusHistory record (immutable)
   - Every significant action creates an AuditLog entry
   - Students can only query tickets where `createdBy === self` (enforced in backend query, not UI)

3. **Why MongoDB:**
   - Flexible document schemas for ticket metadata that varies by category
   - Rapid iteration during development
   - Mongoose provides schema validation at the application layer
   - Zod schemas on backend provide request validation at the API boundary

4. **Data integrity approach:**
   - No direct DB access from AI service — backend is the sole writer
   - Zod validation on all inbound requests
   - Mongoose schema constraints (required fields, enums, refs)
   - Indexes on: ticket status, createdBy, category, timestamp

### Artifacts Needed
- [ ] Simplified ERD or entity-relationship table (label as **Figure 2** or **Table X**)
- [ ] Pull actual field names from `backend/src/models/` to ensure accuracy

### Source Files to Reference
- `backend/src/models/` — Mongoose model definitions
- `backend/src/validation/` — Zod schemas
