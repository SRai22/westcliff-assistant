# PA4-06: UI Design & Screenshots Section

**Parent:** PA4 — Phase 3: Project Design
**Target length:** 1–1.5 pages
**Priority:** Medium — screenshots are strong evidence but must have written descriptions

---

## What to Write

**Section 3.6 — User Interface Design**

### Content

1. **Student-Facing Views:**
   - **Login page** — Google OAuth sign-in, Westcliff branding
   - **Conversational Triage** — student types issue in natural language; AI returns category, clarifying questions, suggested articles; student confirms pre-filled ticket
   - **My Tickets** — list of student's own tickets with status badges
   - **Ticket Detail** — conversation thread, status history, real-time updates via Socket.io

2. **Staff-Facing Views:**
   - **Kanban Dashboard** — all tickets organized by status columns (NEW → IN_PROGRESS → WAITING → RESOLVED); drag-and-drop or dropdown status changes
   - **Ticket Detail (Admin)** — full conversation, internal notes (hidden from students), status/priority controls, assignee selector
   - **AI Assist Panel** — three buttons: Summarize, Draft Response, Suggest Next Steps; output labeled as AI-generated; staff edits before sending

3. **Functional descriptions** (one paragraph per screen):
   - Describe what the user can do, what data is shown, how it connects to the backend
   - Emphasize: student sees only their own data; staff sees everything; AI output is always a draft

4. **Design principles:**
   - Role-based routing: same SPA, different views based on authenticated role
   - Real-time: Socket.io for live message delivery and status change notifications
   - Accessibility: standard web accessibility (semantic HTML, keyboard navigation)
   - Responsive: works on desktop and mobile browsers

### Action Items
- [ ] Start the system (`docker compose up --build`) and take screenshots
- [ ] Student flow: login → triage → ticket list → ticket detail (4 screenshots)
- [ ] Staff flow: kanban → ticket detail → AI assist panel (3 screenshots)
- [ ] Label each as **Figure X** with APA-style caption below
- [ ] Write 1 paragraph functional description per screenshot

### Note
Screenshots of the working system serve as mock-ups (per action-plan.md). This is stronger than wireframes because it demonstrates a functioning implementation.
