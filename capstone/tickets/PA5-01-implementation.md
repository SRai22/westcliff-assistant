# PA5-01: Implementation Plan (Phase 4)

**Parent:** PA5 — Week 6
**Target length:** 4–5 pages
**Status:** ❌ TODO — due Week 6

---

## What to Write

**Chapter 4 — Implementation Plan**

### Sections

1. **Sprint breakdown by phase** — map actual development to Agile sprints:
   - Sprint 1: Backend foundation (MongoDB, models, auth, RBAC, ticket CRUD)
   - Sprint 2: Backend messaging, KB, AI proxy, Socket.io
   - Sprint 3: AI service (LLM clients, prompt templates, guardrails, endpoints)
   - Sprint 4: Backend-AI integration (live AI connection, seed data)
   - Sprint 5: Frontend integration (API client, real endpoints, Socket.io)
   - Sprint 6: Polish (error handling, cleanup, testing)

2. **Task dependencies and timeline** — Gantt-style or table showing what blocks what

3. **Docker-first deployment approach** — `docker compose up --build` runs the entire stack; reproducible across environments

4. **Testing strategy** — Vitest + React Testing Library (frontend), integration tests (backend)

5. **Staff training plan** — how admin users learn the Kanban dashboard and AI assist tools

6. **Change management** — rollout plan: pilot with one department → expand to all 10
