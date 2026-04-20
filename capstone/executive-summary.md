# AI-Powered Student Services Portal — Executive Summary

**Prepared by:** Shravan S. Rai | M.S. COTE, Westcliff University
**Date:** April 2026 | **Status:** Working prototype complete

---

## The Problem

When a Westcliff student has an issue — a financial aid question, a registration hold, an IT problem — they have to figure out which of 10 departments to contact. Many don't know. They email the wrong office, get redirected, wait, try again. On the staff side, requests arrive unstructured and have to be manually read, categorized, and routed.

This is the same inefficiency that EDUCAUSE's 2025 Top 10 identified as one of higher education's most pressing operational challenges: students shouldn't need to understand an institution's org chart to get help.

## What I Built

A web-based student services portal designed specifically for Westcliff. Three components:

- **For students:** A conversational intake where they describe their issue in plain language. AI classifies it into the right department, asks clarifying questions, suggests relevant knowledge base articles, and drafts a structured ticket — no forms, no dropdowns, no guessing which office to call.

- **For staff:** A Kanban dashboard with AI tools that summarize ticket history, draft professional responses, and recommend next steps. Staff review and approve everything before it reaches students. The AI assists; it doesn't decide.

- **Under the hood:** Google OAuth restricted to @westcliff.edu accounts, role-based access control, a complete audit trail of every action, and an AI service that never touches student records. FERPA compliance is built into the architecture, not bolted on.

The system is working. All three services run, the AI triage classifies across Westcliff's 10 departments, and the staff dashboard is functional with real-time updates.

## What It Costs

| | Custom Build | ServiceNow | Salesforce |
|---|---:|---:|---:|
| Year 1 | $27,159 | $150,000+ | $120,000+ |
| Annual recurring | $5,059 | $80,000+ | $70,000+ |
| **3-Year Total** | **$37,277** | **$310,000+** | **$260,000+** |

The custom build total includes everything: cloud hosting ($288/yr), managed database ($840/yr), LLM API costs ($31/yr at median volume, based on actual prompt template sizes), and a part-time developer for maintenance ($3,900/yr). Year 1 adds ~$26,000 in development labor. There are no per-user licensing fees and no vendor lock-in — the entire stack is open-source. Even in the worst-case scenario (GPT-4o at full volume), LLM costs reach only $780/yr — still under 15% of the recurring budget.

## What I'm Proposing

**Phase 1 — Pilot (1 semester, Summer/Fall 2026)**
Pick one department — IT or Registrar, whichever has the appetite. Run the portal with a small student cohort (50-100) for 8 weeks. Track triage accuracy, time to resolution, and student satisfaction. This gives Westcliff real data, not projections.

**What I need from the university:**
- One department willing to participate
- A small group of student testers
- One staff member using the dashboard
- Access to compare against current resolution times (if available)

**Phase 2 — Expand or stop.**
If the pilot numbers are good, roll out to additional departments. If they're not, the university spent nothing — the infrastructure cost for a pilot is under $100/month.

## Why This Matters for Westcliff

Westcliff is a growing institution — 6,524 FTE students, predominantly online and graduate. The student services workload scales with enrollment, but staffing doesn't scale at the same rate. An AI-assisted portal doesn't replace staff; it gives each staff member leverage to handle more requests, faster, with better routing from day one.

And there's an institutional story here too. A university building its own AI-powered student services tool — designed by a graduate student, piloted internally, with full FERPA compliance — is a different kind of proof point than buying a vendor platform.

---

*Full technical documentation available in the capstone project (Chapter 3: Project Design). Working demo video previously shared with Professor McCoy.*
