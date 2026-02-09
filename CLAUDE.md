# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the **single source of truth** for architecture, constraints, and intent. Sub-project CLAUDE.md files exist in `frontend/`, `backend/`, and `ai/` for service-specific rules.

---

## Project Goal

A Westcliff-themed Student Services SPA that uses Google sign-in and a **guided AI intake flow** to convert student issues into structured support tickets that staff manage via a Kanban dashboard.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React + TypeScript, Vite, SPA |
| Backend | Express + TypeScript, MongoDB (Mongoose) |
| AI Service | Python, FastAPI |
| Auth | Google OAuth 2.0 |
| Package Manager | npm (frontend & backend) |
| Testing | Vitest + React Testing Library (frontend) |
| Infrastructure | Docker Compose (all services) |

---

## Development Commands (Docker-first)

```bash
# Start all services (frontend + backend + mongo + ai)
docker compose up --build

# Start individual services
docker compose up --build frontend
docker compose up --build backend mongo
docker compose up --build ai

# Stop
docker compose down

# Reset all data (wipes MongoDB volumes)
docker compose down -v
```

### Running outside Docker (when needed)

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev

# AI service
cd ai && pip install -r requirements.txt && uvicorn src.main:app --reload

# Frontend tests
cd frontend && npm test          # run all
cd frontend && npx vitest <file> # run single test file
```

---

## Architecture (3 Services)

```
Browser (SPA) → Backend (Express) → MongoDB
                    ↓
               AI Service (FastAPI)
```

- **Frontend** serves the SPA. Students and staff share one app with role-based routing.
- **Backend** is the sole API gateway. It handles auth, RBAC, ticket CRUD, and proxies AI calls. The frontend never talks directly to the AI service.
- **AI Service** performs intake triage (classify + clarify + draft ticket) and staff-assist features (summarize, draft reply). Returns structured JSON only. Has no database access.

### Data Flow: AI Intake

1. Student describes issue → backend forwards to AI service
2. AI returns: category, clarifying questions, suggested articles, ticket draft
3. Student answers questions → backend sends follow-up to AI
4. Student reviews prefilled ticket → confirms → backend writes to MongoDB

---

## Domain Constants

### Categories (11)
`Information Technology` · `Learning Technologies` · `Student Services` · `International Affairs` · `Registrar` · `Student Accounts` · `Financial Aid` · `Alumni Affairs and Career Services` · `Military / Veterans` · `Student Life` · `Learning Experience Design (LXD) Team`

### Ticket Status
`NEW` → `IN_PROGRESS` → `WAITING` → `RESOLVED`

### Priority
`LOW` · `MEDIUM` · `HIGH`

### Roles
`STUDENT` · `STAFF` (includes admin)

---

## Non-Negotiable Rules

1. **AI output is non-ratified** — all AI drafts require staff review before sending
2. **Backend enforces all authorization** — never trust frontend role flags
3. **AI never writes to DB** — backend is the only writer
4. **SPA only** — no server-rendered pages
5. **Docker is the default dev environment**
6. **Students see only their own tickets; staff see all**
7. **Every ticket status change creates a history + audit entry**

---

## Claude Operating Rules

1. Read existing code before changing anything
2. Respect the project structure — do not create new top-level folders without updating this file
3. Keep AI responses deterministic and schema-validated (Zod on backend, Pydantic on AI service)
4. Update `.env.example` when environment variables change
5. Never blur student vs staff permissions
6. Use Zod or Joi for all backend request validation
7. RBAC must be enforced in middleware, not in controllers
