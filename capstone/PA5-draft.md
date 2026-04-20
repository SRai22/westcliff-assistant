# Chapter 4 & 5: Implementation Plan and Ongoing Maintenance
## AI-Powered Student Services Portal: A Business Case for Westcliff University

> **Format note for Word/Docs:** APA 7 — 12pt Times New Roman, double-spaced, 1" margins, running head, page numbers. This document covers Chapters 4 and 5 and appends directly after the Phase 3 chapter.

---

## Chapter 4: Implementation Plan

The design documented in Chapter 3 was implemented through an iterative, sprint-based development process aligned with Agile Software Development Life Cycle (SDLC) principles. Development was organized into six sequential sprints, each targeting a discrete layer of the system architecture and each gated on the successful completion of preceding work. This chapter documents the project schedule, the sprint structure and deliverables, the deployment model, the testing strategy, the staff training plan, and the phased rollout approach for production deployment.

### Project Schedule

Table 8 presents the implementation schedule across all six development sprints and the planned production deployment phase. Sprint durations reflect the actual time required to complete each layer of the system and the dependency relationships between components. Generic week numbering is used to preserve applicability as a planning reference across varying institutional calendar constraints.

**Table 8**

*Implementation Schedule — Development Sprints and Production Deployment*

| Sprint | Focus Area | Key Deliverables | Duration |
|---|---|---|:---:|
| Sprint 1 | Backend Foundation | MongoDB connection, Mongoose data models, Google OAuth authentication, role-based access control (RBAC) middleware, ticket CRUD endpoints | Weeks 1–2 |
| Sprint 2 | Backend Messaging and Knowledge Base | Ticket message routes, internal note support, knowledge base article routes and seed script, AI proxy endpoints (stubs), Socket.io real-time setup | Weeks 3–4 |
| Sprint 3 | AI Service Core | LLM client abstraction layer, OpenAI and Gemini implementations, Pydantic request/response schemas, YAML prompt templates, guardrails module (input validation, output filtering, PII sanitization) | Weeks 5–6 |
| Sprint 4 | Backend-AI Live Integration | AI proxy stubs replaced with live AI service connections; fallback stub behavior retained for resilience; enhanced database seed script with representative users, tickets, and messages | Week 7 |
| Sprint 5 | Frontend Integration | API client layer, Google OAuth UI, ticket list and detail views, knowledge base UI, admin Kanban dashboard, AI Assist panel, Socket.io real-time message and status-change delivery | Weeks 8–9 |
| Sprint 6 | Hardening and Cleanup | Conversational triage confirmation flow, removal of prototype mock data, error handling, loading state indicators | Weeks 10–11 |
| Sprint 7 | Production Deployment (Planned) | Infrastructure provisioning, environment configuration, database migration, one-department pilot launch | Weeks 12–14 |

*Note.* Sprint 7 represents the planned production deployment phase and is written prospectively. Sprints 1–6 reflect completed development work.

### Sprint Descriptions

Each sprint was gated on the completion of preceding work. Sprints 1 and 2 established the backend foundation — data models, authentication, RBAC, ticket CRUD, messaging, and the knowledge base — with AI proxy endpoints scaffolded as static stubs to allow frontend and AI development to proceed in parallel. Sprint 3 built the AI service as a fully independent microservice with no database access, validated in isolation before any integration began. Sprint 4 replaced the stubs with live AI service connections while retaining fallback behavior for resilience. Sprint 5 completed the frontend integration, connecting all student and staff workflows to live backend endpoints and enabling real-time message and status-change delivery via Socket.io. Sprint 6 addressed remaining hardening items: the triage confirmation flow, removal of prototype mock data, and user-facing error handling.

### Deployment Architecture

The system is packaged as a four-service Docker Compose application — frontend, backend API gateway, AI service, and MongoDB database — launchable with a single command on any environment with Docker installed. This containerized model produces an identical runtime across development, staging, and production without host-level software installation, reducing the operational burden on a small institutional IT team. Each service runs in an isolated container: the AI service can be scaled or restarted independently of the gateway and frontend, and taken offline entirely without affecting core ticket management. The DigitalOcean virtual machine specified in the Chapter 3 budget is the target production host.

### Testing Strategy

The system's testing approach follows a layered strategy matching test type to risk level. Backend API endpoints are covered by integration tests that verify authentication enforcement, RBAC behavior, ticket lifecycle transitions, and AI proxy connectivity. These tests execute against a real database instance, not a simulated one, ensuring that test results reflect actual persistence behavior rather than mock assumptions. Frontend components are covered by unit and integration tests using Vitest and React Testing Library, focusing on user interactions, state management, and API client behavior. AI service response schemas are validated by Pydantic at the service boundary, providing runtime enforcement that the language model's output conforms to the expected structure before it reaches the API gateway or the client.

### Staff Training Plan

**Training Audiences.** Two distinct staff audiences require training prior to production use. The first audience is student services staff who will manage tickets through the Kanban dashboard on a daily basis. The second audience is the designated IT administrator responsible for system configuration, environment variable management, and first-line incident response.

**Staff Track: Kanban Dashboard and AI Assist.** Student services staff require competency in four areas: (1) navigating the Kanban board — filtering tickets by status and department, understanding the New → In Progress → Waiting → Resolved status progression, and using drag-and-drop or dropdown status updates; (2) managing ticket detail — reading conversation history, adding staff replies, distinguishing internal notes (visible only to staff) from student-facing messages; (3) using the AI Assist panel — invoking Summarize, Draft Response, and Suggest Next Steps; understanding that all AI-generated output requires staff review and approval before it is sent to a student; and (4) ticket assignment and escalation — assigning tickets to specific staff members and using the Waiting status for tickets pending student follow-up.

Delivery format: a one-hour live walkthrough session conducted by the implementing developer or a trained department lead, followed by a one-page quick reference card covering the most common workflows. Training is completed before the pilot launch and repeated for each department cohort as the rollout expands.

**IT Administrator Track.** The administrator requires familiarity with the Docker Compose command set for starting, stopping, and updating services; environment variable configuration for LLM provider selection and API key management; MongoDB Atlas backup verification and restore procedure; and the Google OAuth application configuration in Google Cloud Console for credential rotation. This training is delivered as a documented runbook rather than a live session, allowing the administrator to reference it independently during routine maintenance and incident response.

### Change Management and Rollout

Production deployment will follow a phased rollout strategy designed to validate the system under real operational conditions before full institutional adoption. In the pilot phase (Weeks 12–14), the system will be activated for a single high-volume department — Student Accounts or Information Technology — selected for their ticket throughput and staff readiness. Pilot staff will use the system exclusively for all new student requests during this window, with the implementing team available for immediate support. Feedback will be collected through structured weekly check-ins covering triage accuracy, AI assist usefulness, and any workflow friction points.

Following a four-week pilot period, feedback findings will be reviewed and any critical issues resolved before expansion. Remaining departments will be onboarded in cohorts of two to three over the following four to six weeks, until all ten student service departments are active. This graduated approach limits the operational risk of a full simultaneous cutover and allows training delivery to be sequenced rather than conducted as a single large event.

---

## Chapter 5: Ongoing Maintenance and Recommendations

A production information system requires sustained operational attention beyond its initial deployment. This chapter documents the maintenance procedures, monitoring controls, disaster recovery posture, and future development roadmap for the AI-Powered Student Services Portal following go-live.

### Operational Maintenance

Prompt templates that govern AI triage quality are version-controlled files, not compiled code, and can be updated without a full software deployment. A quarterly review cycle is recommended: department staff flag misclassifications, and the IT administrator updates the relevant templates and redeploys the AI service container. This cadence aligns with Liu et al.'s (2025) finding that iterative prompt refinement sustains classification accuracy as new request types emerge. Third-party dependencies across all three services should be reviewed monthly using automated tooling (e.g., Dependabot), with critical security patches applied immediately. Updated dependencies are applied through a container rebuild, requiring no host-level changes.

Google OAuth credentials do not require periodic rotation, but the Google Cloud application should be registered to a shared institutional service account rather than an individual staff member's account, to prevent access loss from personnel changes. MongoDB Atlas automated daily backups with point-in-time recovery are included in the M10 cluster tier; no additional backup tooling is required. The IT administrator should verify monthly that recent backups are accessible through the Atlas console.

### Monitoring and Cost Controls

All three services should be monitored by a lightweight uptime check (UptimeRobot free tier or equivalent) targeting the API gateway health endpoint, which confirms both backend and database availability with a single check. LLM API spend should be reviewed monthly against the Chapter 3 projections — median-case annual cost is $31 at the cost-optimized tier, worst case $780 — with a threshold alert at 20% of the projected annual figure to catch volume anomalies early. The audit log and status history collections already capture the data needed for core service desk metrics (ticket volume by department, median resolution time, self-service deflection rate); these can be queried directly or surfaced through the analytics dashboard described in the future roadmap below.

### Disaster Recovery

Two recovery objectives define the system's disaster recovery posture. The **Recovery Time Objective (RTO)** — the maximum acceptable time from failure detection to service restoration — is set at four hours. The **Recovery Point Objective (RPO)** — the maximum acceptable data loss measured in time — is set at 24 hours, corresponding to the daily backup cycle.

Table 9 maps each system component to its failure scenario and the procedure that achieves the RTO and RPO targets.

**Table 9**

*Disaster Recovery Procedures by Component*

| Component | Failure Scenario | Recovery Procedure | RTO Impact | RPO Impact |
|---|---|---|:---:|:---:|
| MongoDB database | Data corruption or accidental deletion | Atlas point-in-time restore to most recent daily snapshot | < 2 hours | ≤ 24 hours |
| AI service | LLM provider outage or container crash | Stub fallback responses activate automatically; no manual intervention required for basic ticket functionality | Immediate (automatic) | Not applicable |
| Backend API gateway | Container crash | `docker compose up -d backend` restarts the service; active sessions are preserved in the database | < 15 minutes | Not applicable |
| Frontend | Container crash | `docker compose up -d frontend` restarts the service; no state is held in the frontend container | < 15 minutes | Not applicable |
| Session loss (full restart) | All services down and restarted | Users re-authenticate through Google OAuth; sessions are restored after a single login | < 1 minute per user | Not applicable |

*Note.* AI service fallback behavior ensures ticket management remains functional during LLM provider outages; triage accuracy reverts to static defaults until the service is restored. Recovery procedures for each component will be documented in a runbook maintained in the system's internal documentation repository.

### Future Roadmap

Three enhancements are identified as the highest-priority post-deployment improvements, ranked by institutional impact and feasibility relative to the existing architecture.

**SLA Auto-Escalation.** The current system supports manual status and priority updates but does not enforce resolution time targets. An SLA auto-escalation feature would define department-specific response thresholds — for example, an initial staff response within 24 hours for High-priority tickets — and automatically escalate priority or notify a supervisor when targets are at risk. The technical foundation is already present: the audit log and status history collections provide the timestamps needed to compute elapsed response time for any ticket. Razma and Jurkus (2026) identified unresolved ticket backlog as a primary operational cost driver, making this enhancement a direct extension of the research case for the portal.

**Analytics Dashboard.** The system accumulates ticket volume, resolution time, and knowledge base deflection data but does not currently surface it graphically. An administrative analytics dashboard would enable data-driven staffing and content investment decisions — directly addressing the gap identified by Gaftandzhieva et al. (2023), who found that data analytics tools remain underutilized in higher education despite their demonstrated value for tracking performance indicators and improving resource allocation. The dashboard can be added as a new frontend route querying existing backend aggregation endpoints, requiring no data model changes.

**SIS and LMS Integration.** The highest long-term institutional value opportunity is connecting the portal to Westcliff's Student Information System and Learning Management System. SIS integration would allow the API gateway to enrich ticket context with a student's enrollment status and program, providing staff with relevant academic context without requiring students to repeat information the institution already holds. Both integrations involve student education records and will require a formal FERPA data use analysis and vendor data sharing agreements before implementation begins.

### Residual Risks

The security controls documented in Chapter 3 — authentication through Google OAuth, role-based access control enforced at the API gateway, AI service data isolation, and the comprehensive audit trail — remain in place and continue to mitigate the STRIDE threat categories identified in that chapter. The following risks represent the operational landscape that changes after production deployment, when real student data flows through the system under live institutional conditions.

**LLM Provider Pricing and Policy Changes.** The system's AI capabilities depend on external APIs whose pricing and acceptable-use policies are set by third-party vendors. LLM costs represent less than 2% of total recurring costs even in the worst-case scenario, and the multi-provider abstraction layer allows the institution to switch between OpenAI and Google Gemini through a configuration change — mitigating vendor lock-in without code modifications.

**Evolving FERPA Guidance on AI-Processed Student Data.** The Department of Education's interpretation of FERPA obligations for AI-processed student content remains an active area of regulatory development. The current architecture — in which the AI service receives only issue description text and has no database connection — positions the institution favorably under current guidance (U.S. Department of Education, 2021). Westcliff's institutional counsel should be informed of the system's data flow at deployment and consulted if the Department issues new AI-specific FERPA guidance.

**Staff Adoption Resistance.** Staff with established manual routing practices may resist AI-generated suggestions, particularly if early triage outputs are occasionally inaccurate. The phased rollout plan — piloting with one department, collecting feedback, refining prompt templates before expansion — builds confidence progressively. Training should frame AI Assist tools as time-saving aids rather than replacements for professional judgment; the non-ratified output requirement, which prevents any AI-generated content from reaching students without staff approval, should be communicated as an institutional commitment.

---

## References

Liu, F., He, X., Zhang, T., Chen, J., Li, Y., Yi, L., Zhang, H., Wu, G., & Shi, R. (2025). TickIt: Leveraging large language models for automated ticket escalation. In *Proceedings of the 33rd ACM International Conference on the Foundations of Software Engineering (FSE '25)*. https://doi.org/10.1145/3696630.3728558

Gaftandzhieva, S., Hussain, S., Hilčenko, S., Doneva, R., & Boykova, K. (2023). Data-driven decision making in higher education institutions: State-of-play. *International Journal of Advanced Computer Science and Applications*, *14*(6), 397–407. https://doi.org/10.14569/IJACSA.2023.0140642

Razma, A., & Jurkus, R. (2026). AI-based classification of IT support requests in enterprise service management systems. *Systems*, *14*(2), Article 223. https://doi.org/10.3390/systems14020223

U.S. Department of Education. (2021). *Family Educational Rights and Privacy Act (FERPA)*. https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html
