# Chapter 3: Project Design

## AI-Powered Student Services Portal: A Business Case for Westcliff University

> **Format note for Word/Docs:** APA 7 — 12pt Times New Roman, double-spaced, 1" margins, running head, page numbers. This document is Chapter 3 and appends directly after the Phase 2 chapter.

---

## Chapter 3: Project Design

The recommendation established in Chapter 2 identified a custom-built, AI-native student services portal as the highest-scoring alternative across all five weighted decision criteria. This chapter translates that recommendation into a concrete system design, specifying the architecture, data model, security controls, AI triage engine, user interface, and budget required to implement the proposed solution. Every design decision documented below traces directly to the institutional requirements, compliance obligations, and operational constraints identified in the preceding phases.

### Solution Architecture

The portal follows a three-service architecture in which each service has a single, clearly bounded responsibility. Figure 1 illustrates the system decomposition and the relationships between components.

[Insert Figure 1 here]

**Web Application.** The client layer is a single-page application that serves both student and staff users through role-based routing. Students access a conversational intake interface, a personal ticket history, and a searchable knowledge base. Staff access a Kanban-style ticket management dashboard with AI-assisted tools for summarization, draft response generation, and next-step recommendations. Authentication is handled through Google OAuth 2.0, restricted to verified @westcliff.edu institutional accounts. The application communicates exclusively with the API Gateway; it has no direct connection to the AI Service or the database.

**API Gateway.** The central backend service is the sole entry point for all client requests and the only component with database write access. This single-gateway design enforces a critical architectural constraint: every request must pass through authentication verification, role-based access control, and input validation before reaching any business logic or data store. The gateway also serves as the bridge between the client and the AI Service, forwarding intake and assist requests and returning structured responses. Real-time communication between the server and connected clients is maintained through WebSocket connections, enabling immediate message delivery and status change notifications without page refresh.

**AI Service.** The AI processing layer is an isolated, stateless microservice that performs two categories of work: student-facing intake triage (issue classification, clarifying question generation, and ticket draft creation) and staff-facing assistance (conversation summarization, reply drafting, and next-step suggestions). This service connects to a large language model provider through an abstraction layer that supports multiple vendors — currently OpenAI GPT and Google Gemini — allowing the institution to switch providers through configuration without modifying application code. The AI Service has no database connection and no access to student records. It receives only the text of a student's issue description from the API Gateway and returns structured data. This isolation is a deliberate design decision that limits the scope of data exposure and simplifies compliance analysis.

**Database.** A document-oriented database stores all persistent state: user profiles, tickets, conversation messages, knowledge base articles, and — critically — a complete status history and audit log of every action taken in the system. The database is accessed exclusively by the API Gateway. The AI Service has no connection string, no credentials, and no read or write path to any stored data.

**External Services.** The system depends on two categories of external service. Google OAuth 2.0 provides identity verification, ensuring that only holders of valid @westcliff.edu accounts can authenticate. Large language model APIs (OpenAI or Google Gemini, selected by configuration) provide the natural language processing capabilities that power the triage and assist features. Both external dependencies are accessed only from the server side — the client application never communicates with external services directly.

The three-service decomposition was selected for three reasons directly relevant to Westcliff's institutional context. First, isolating the AI Service ensures that no student personally identifiable information reaches the language model provider, which simplifies the FERPA compliance posture documented in the following section. Second, separating the gateway from the AI processing layer allows independent scaling — the computationally intensive AI workload can be resourced separately from the transactional ticket management workload. Third, the containerized deployment model (Docker Compose orchestration) enables reproducible environments from development through production, reducing the operational burden on a small institutional IT team.

### Data Model

The system's persistent data is organized into six primary entities, each designed to enforce a specific domain rule. Table 2 summarizes the entity structure and purpose.

**Table 2**

*Primary Data Entities and Their Roles*

| Entity | Purpose | Key Attributes |
|---|---|---|
| **User** | Stores student and staff identity | Institutional email, display name, role (Student or Staff), Google account identifier |
| **Ticket** | Core work item representing a student issue | Summary, description, category (1 of 10 departments), priority (Low / Medium / High), status (New / In Progress / Waiting / Resolved), assigned staff member |
| **Message** | Conversation thread within a ticket | Sender role, message body, internal-note flag (staff-only visibility) |
| **Status History** | Immutable log of every ticket status change | Previous status, new status, staff member who made the change, timestamp |
| **Audit Log** | Comprehensive action trail for compliance | Action type, user who performed it, associated ticket, metadata, IP address, timestamp |
| **Article** | Knowledge base entry for student self-service | Title, category, content, tags, publication status, view count |

**Entity Relationships and Domain Rules.** Each ticket is linked to the student who created it and, optionally, to the staff member assigned to resolve it. Messages belong to a ticket and are ordered chronologically. The internal-note flag on messages allows staff to add private annotations that are invisible to students — this distinction is enforced at the data query level, not merely in the user interface, so that a compromised or modified client cannot expose internal notes.

Two entities exist specifically for governance. The Status History collection creates an immutable record every time a ticket's status changes: the previous status, the new status, the staff member responsible, and the timestamp. This record cannot be edited or deleted through the application. The Audit Log captures a broader set of actions — ticket creation, message posting, assignment changes, and AI-assisted operations — with the identity of the user who performed each action. Together, these two entities provide the traceability required for institutional reporting and compliance documentation.

The database uses a document-oriented model, which allows ticket metadata to vary by department category without requiring rigid schema migrations. Input validation is enforced at two layers: request-level validation ensures that all inbound data conforms to defined schemas before it reaches the database, and model-level constraints enforce required fields, enumerated values, and referential relationships. This defense-in-depth approach — a foundational principle in the OWASP Application Security Verification Standard (OWASP Foundation, 2021) — prevents invalid data from entering the system regardless of whether the request originates from the standard client application or from any other source.

### Security Architecture and Governance

This section documents the authentication, authorization, data privacy, audit, and threat mitigation controls designed into the system. These controls are not optional features — they are structural components that the system cannot function without.

**Authentication.** Users authenticate through Google OAuth 2.0 using their institutional @westcliff.edu accounts. The process works as follows: the student or staff member clicks the Google sign-in button, completes authentication with Google, and receives a cryptographic identity token. The client application sends this token to the API Gateway, which verifies it directly with Google's servers. Upon successful verification, the gateway creates a server-side session and returns a session cookie to the client. All subsequent requests are authenticated by this session cookie. The system stores no passwords, manages no credential database, and relies entirely on Google's identity infrastructure — including any multi-factor authentication the user has configured on their Google account.

Role assignment is determined automatically by email address. Accounts with @westcliff.edu addresses that do not contain "student" in the local part are assigned the Staff role; all other accounts receive the Student role. Sessions expire after 14 days of inactivity, and the session store uses the same database as the application, eliminating the need for a separate caching layer.

**Role-Based Access Control.** The system enforces two roles — Student and Staff — through middleware that executes on every request before any business logic runs. This is a critical design choice: authorization is not checked in the user interface or in individual page components, where it could be bypassed by a modified client. It is checked in the API Gateway's request pipeline, where it cannot be circumvented without valid server-side session credentials.

Students can create tickets, view and respond to their own tickets, and browse the knowledge base. They cannot view tickets created by other students, access internal staff notes, change ticket status, or use AI-assisted staff tools. The ownership restriction is enforced at the database query level: when a student requests their ticket list, the query automatically filters to records matching their user identity. A student who manually constructs a request for another student's ticket receives a denial response from the server, regardless of how the client application is configured.

Staff can view all tickets across all departments, change ticket status, assign tickets to other staff members, add internal notes, and invoke AI-assisted tools (summarize, draft reply, suggest next steps). All staff actions are recorded in the audit log.

**FERPA Compliance by Design.** The Family Educational Rights and Privacy Act (FERPA) governs the handling of student education records at institutions receiving federal funding (U.S. Department of Education, 2021). The system's architecture addresses FERPA requirements through three structural controls:

First, student data residency. All student records — identity information, ticket content, messages, and interaction history — are stored in the institution's own database. No student data is stored in third-party vendor systems. This is a direct contrast to the enterprise platform alternatives evaluated in Chapter 2, where student data would reside in the vendor's cloud infrastructure, creating sub-processor chains that complicate compliance analysis (Czechowski et al., 2024).

Second, AI service data isolation. The AI Service receives only the text of a student's issue description. It does not receive the student's name, email address, student ID, or any other personally identifiable information. The AI Service has no database connection and cannot query student records. This boundary is enforced architecturally — the AI Service literally has no credentials to access the database — not through application-level policy that could be misconfigured.

Third, audit trail completeness. Every action that modifies student data — ticket creation, status changes, message posting, assignment changes — is recorded in an immutable audit log with the identity of the user who performed it and the timestamp. This log supports the institutional accountability requirements of FERPA and provides documentary evidence for compliance reviews.

**Threat Mitigation.** Table 3 identifies the primary threat categories applicable to this system, following the STRIDE threat modeling framework originally developed by Microsoft for identifying security threats in software systems (Shostack, 2014), and documents the specific design controls that mitigate each threat.

**Table 3**

*Threat Analysis and Mitigation Controls (STRIDE Framework)*

| Threat Category | Description | Mitigation |
|---|---|---|
| Spoofing | Attacker impersonates a legitimate user | Google OAuth restricts authentication to verified @westcliff.edu accounts; no local password database exists to compromise |
| Tampering | Unauthorized modification of ticket data | All data mutations pass through the API Gateway's authentication and role-based access middleware; direct database access is not exposed |
| Repudiation | User denies performing an action | Audit log records every action with user identity and timestamp; status history provides an immutable change record |
| Information disclosure | Student views another student's data | Ownership filtering is enforced at the database query level; internal staff notes are excluded from student-facing queries |
| Denial of service | Excessive requests degrade system availability | AI proxy endpoints implement rate limiting; the stateless AI Service can be horizontally scaled independently of the gateway |
| Elevation of privilege | Student accesses staff-only functionality | Role-based middleware blocks staff-only routes at the API Gateway; role is verified from the server-side session on every request |

**AI-Specific Security Controls.** The AI Service includes a dedicated guardrails module that operates at three levels. Before any request reaches the language model, input validation checks for prompt injection attempts — patterns designed to override the model's instructions — as well as off-topic or harmful content. After the language model generates a response, output validation checks for forbidden phrases that the model should never produce, such as approvals, legal claims, immigration promises, or financial guarantees. A separate sanitization function strips personally identifiable information patterns (credit card numbers, Social Security numbers, email addresses, phone numbers) from any text before it is logged, providing a defense-in-depth layer even if PII unexpectedly appears in a request.

All AI-generated content carries a mandatory flag requiring staff review before it can be sent to a student. This flag is enforced in application code — even if the language model's response omits it, the system restores it before returning the response. This design reflects the non-negotiable project rule established at the outset: AI output is non-ratified and requires human approval.

**Residual Risks.** No system eliminates all risk. The following risks remain after the controls described above are in place:

- *Social engineering against Google accounts.* If an attacker gains access to a legitimate @westcliff.edu Google account, they inherit that user's permissions. Google's own multi-factor authentication mitigates this risk but does not eliminate it.
- *Adversarial prompt injection.* While the guardrails module detects known injection patterns, novel attack techniques may bypass current filters. The non-ratified output rule provides a second layer of defense: even if a manipulated response is generated, a staff member must review it before it reaches a student.
- *Language model provider policy changes.* The system depends on external LLM APIs. Provider pricing changes, rate limit adjustments, or policy modifications could affect availability or cost. The multi-provider abstraction layer mitigates vendor lock-in, and fallback stub responses ensure the system degrades gracefully if the AI service is temporarily unavailable.

### AI-Powered Triage Engine

The triage engine is the core differentiator of this system — the feature that enterprise platforms evaluated in Chapter 2 do not provide natively (Czechowski et al., 2024). Figure 2 illustrates the complete intake data flow.

[Insert Figure 2 here]

**Conversational Intake.** The student describes their issue in plain language through a chat-style interface. There is no form to fill out, no dropdown menu to select a department, and no requirement that the student know which office handles their concern — eliminating the fixed-taxonomy limitation documented by Windiatmoko et al. (2021). The system forwards the text to the AI Service, which classifies it into one of the university's ten service departments, assigns a confidence score, generates up to four clarifying questions to improve classification accuracy, identifies relevant knowledge base articles that may resolve the issue without staff intervention, and produces a draft ticket (summary, description, and priority level).

If clarifying questions are generated, the student answers them in the same conversational interface, and the AI Service refines its classification and ticket draft. This two-round approach mirrors the finding from Liu et al. (2025) that iterative context gathering significantly improves classification accuracy for ambiguous requests. Once the student reviews and confirms the pre-filled ticket — editing any fields as needed — the API Gateway writes the ticket, an initial message, a status history entry, and an audit log record to the database. The AI Service plays no role in the database write; it has no connection to it.

**Staff-Assist Tools.** Once a ticket enters the staff dashboard, three AI-powered tools are available:

- *Summarize* condenses the full conversation history into a brief overview, enabling staff to quickly understand the context of a ticket without reading every message.
- *Draft Reply* generates a professional response based on the ticket content, with configurable tone (professional, friendly, empathetic, or concise). Staff review, edit, and approve the draft before sending.
- *Suggest Next Steps* recommends actionable resolution steps based on the ticket category and conversation content.

All three tools return output labeled as AI-generated. The system enforces a staff-review requirement on every AI response — this is not a user-interface convention but a system invariant validated by both the AI Service and the API Gateway.

**Provider Abstraction.** The AI Service communicates with large language models through an abstraction layer that decouples the application logic from any specific vendor. The system currently supports OpenAI (GPT-4o) and Google Gemini, selectable through environment configuration. This design allows the institution to switch providers in response to pricing changes, performance differences, or policy requirements without modifying application code. Prompt instructions are stored as version-controlled templates that can be updated independently of the codebase, enabling iterative refinement of triage accuracy without requiring software deployments.

The production validation documented by Liu et al. (2025) — achieving an F1-score of 0.862 across 20,000+ tickets and a 39% reduction in mean time to repair — and the finding from Razma and Jurkus (2026) that transformer-based models outperform simpler classifiers most dramatically on rare and complex categories, provide empirical grounding for this architectural decision. Westcliff's low-volume departments (Military and Veterans Services, International Affairs, the Resolution Center) are precisely the categories where intelligent triage provides the greatest marginal value over manual routing.

### User Interface Design

The portal serves two user populations through a single web application with role-based views. Screenshots of the implemented system are included as Figures 3 through 5.

[Insert Figure 3: Student Intake — Conversational Triage Interface]

**Student Experience.** After signing in with their institutional Google account, the student is presented with a home screen that includes a text input for describing their issue. Initiating a conversation launches the AI-powered triage interface (Figure 3), which guides the student through issue description, clarifying questions, knowledge base suggestions, and ticket confirmation in a single conversational flow. The student can also access their ticket history — displaying only their own tickets, with status and priority indicators — and browse the knowledge base by category and keyword search.

[Insert Figure 4: Staff Dashboard — Kanban Ticket Management]

[Insert Figure 5: Staff Ticket Detail — AI Assist Panel]

**Staff Experience.** Staff members access a Kanban-style dashboard (Figure 4) that displays all tickets organized by status: New, In Progress, Waiting, and Resolved. Selecting a ticket opens a detail view (Figure 5) with the full conversation history, internal notes (invisible to students), status and priority controls, and the AI Assist panel. The three AI-assist buttons — Summarize, Draft Response, and Suggest Next Steps — generate output in a clearly labeled panel. Staff review and optionally edit the AI output before inserting it into a reply. At no point does AI-generated content reach a student without explicit staff approval.

**Design Principles.** The interface follows three principles derived from the project requirements. First, role-based routing ensures that students and staff see only the views and data appropriate to their role, using the same application and the same URL. Second, real-time communication via WebSocket connections delivers new messages and status changes to all connected users instantly, without requiring page refresh. Third, the conversational intake paradigm eliminates the need for students to navigate departmental structures or select from predefined categories — the AI handles classification, and the student interacts in natural language.

### Project Budget

The budget estimates below are derived from Westcliff University's reported enrollment of 6,524 full-time equivalent students — 1,906 undergraduate and 4,618 graduate (WASC Senior College and University Commission [WSCUC], 2026) — and from published pricing for each infrastructure component.

**Ticket Volume Assumptions.** Annual ticket volume drives the LLM API cost, which is the only usage-based expense. Table 4 presents three scenarios adapted from IT service desk benchmarking data reporting 0.5–1.4 tickets per user per month across industries (Rumburg, 2018), discounted to reflect student services contacts rather than full IT support volume.

**Table 4**

*Annual Ticket Volume Scenarios*

| Scenario | Contacts per Student per Semester | Annual Tickets (6,524 FTE × 2 semesters) | LLM API Calls (4 per ticket) |
|---|:---:|---:|---:|
| Best case | 0.5 | ~6,500 | ~26,000 |
| Median case | 1.0 | ~13,000 | ~52,000 |
| Worst case | 1.5 | ~19,500 | ~78,000 |

Each ticket generates an estimated four LLM API calls: one triage classification (~2,600 input tokens), one follow-up refinement (~2,100 input tokens), and two staff-assist calls — summarize (~1,500 input tokens) and draft reply (~1,700 input tokens). These estimates are derived from the actual prompt template sizes implemented in the system: triage prompts include the full department taxonomy, guardrail directives, and output schema, while assist prompts include the conversation history. Output tokens average approximately 500 per call across all endpoints, reflecting the structured JSON response format.

**LLM API Cost Calculation.** Table 5 estimates annual LLM costs for two providers at their published per-token rates.

**Table 5**

*Annual LLM API Cost by Provider and Volume Scenario*

| Provider | Input Rate (per 1M tokens) | Output Rate (per 1M tokens) | Best Case (26K calls) | Median (52K calls) | Worst Case (78K calls) |
|---|---:|---:|---:|---:|---:|
| OpenAI GPT-4o | $2.50 | $10.00 | $260 | $520 | $780 |
| OpenAI GPT-4o-mini | $0.15 | $0.60 | $16 | $31 | $47 |
| Google Gemini 2.0 Flash | $0.10 | $0.40 | $10 | $21 | $31 |

*Note.* Pricing sourced from OpenAI (2025) and Google (2025) published API rate cards. Per-call cost formula: (2,000 avg input tokens × input rate) + (500 output tokens × output rate). The 2,000-token input average reflects a weighted mean across the four call types per ticket (triage: ~2,600; followup: ~2,100; summarize: ~1,500; draft reply: ~1,700), derived from the implemented prompt templates. GPT-4o-mini and Gemini Flash are suitable for structured classification tasks and represent the cost-optimized configuration; GPT-4o is included as the upper bound for applications requiring higher reasoning capability.

The system's provider abstraction layer allows the institution to select the most cost-effective model for each task. A practical configuration would use a cost-optimized model (GPT-4o-mini or Gemini Flash) for high-volume triage calls and reserve the more capable model for complex assist tasks, yielding a blended annual cost well below the GPT-4o figures.

**Infrastructure and Labor Costs.** Table 6 presents the full project budget across three scenarios. Infrastructure costs are fixed regardless of ticket volume; only LLM API costs vary.

**Table 6**

*Estimated Project Costs: Year 1 and Recurring Annual*

| Category | Item | Source | Year 1 Cost | Annual Recurring |
|---|---|---|---:|---:|
| Development | Developer labor (~400 hours at $65/hour) | BLS, 2024 | $26,000 | — |
| Hosting | Cloud VM (2 vCPU, 4 GB RAM) | DigitalOcean, 2025 | $288 | $288 |
| Database | MongoDB Atlas M10 (dedicated cluster) | MongoDB, 2025 | $840 | $840 |
| LLM API (median) | GPT-4o-mini / Gemini Flash blended | OpenAI, 2025; Google, 2025 | $31 | $31 |
| LLM API (worst case) | GPT-4o at full volume | OpenAI, 2025 | $780 | $780 |
| Authentication | Google OAuth 2.0 (free tier) | Google, 2025 | $0 | $0 |
| Maintenance | Staff developer (~5 hours/month at $65/hour) | BLS, 2024 | — | $3,900 |
| **Total (best/median)** | | | **$27,159** | **$5,059** |
| **Total (worst case)** | | | **$27,908** | **$5,908** |

*Note.* Developer hourly rate based on the Bureau of Labor Statistics median wage for software developers (SOC 15-1252) of $65.04 as of May 2023, the most recent published data (BLS, 2024). Cloud hosting estimate based on DigitalOcean basic droplet pricing at $24/month. MongoDB Atlas M10 pricing at approximately $70/month on AWS us-east-1 (MongoDB, 2025).

**Three-Year Total Cost of Ownership.** Table 7 compares the three-year TCO of the custom-built portal against the enterprise alternatives evaluated in Chapter 2.

**Table 7**

*Three-Year Total Cost of Ownership Comparison*

| | Custom Build (median) | Custom Build (worst case) | ServiceNow | Salesforce Student Success |
|---|---:|---:|---:|---:|
| Year 1 | $27,159 | $27,908 | $150,000+ | $120,000+ |
| Year 2 | $5,059 | $5,908 | $80,000+ | $70,000+ |
| Year 3 | $5,059 | $5,908 | $80,000+ | $70,000+ |
| **3-Year Total** | **$37,277** | **$39,724** | **$310,000+** | **$260,000+** |

*Note.* Enterprise platform estimates are based on published per-agent licensing rates (ServiceNow, 2025; Salesforce, 2025) and the general finding that enterprise ITSM platforms carry implementation and integration costs that are prohibitive for smaller institutions (Czechowski et al., 2024). Exact vendor pricing is sales-assisted, not publicly listed, and varies by institutional agreement; the figures above represent conservative lower-bound estimates.

The custom-built solution costs approximately 12–15% of the enterprise alternatives over three years. This cost advantage derives from three structural factors: the absence of per-user or per-agent licensing fees, the use of open-source software for all application components, and the dramatically low marginal cost of LLM API calls relative to the per-seat pricing model of enterprise ITSM platforms. Notably, LLM API costs — the component most subject to pricing uncertainty — represent less than 2% of the total recurring cost even in the worst-case scenario, making the budget resilient to provider price fluctuations.

---

## References

Bureau of Labor Statistics. (2024, March). *Occupational employment and wages, May 2023: 15-1252 Software developers*. U.S. Department of Labor. https://www.bls.gov/oes/current/oes151252.htm

Czechowski, N., Johnston, M., Kelty, E., & Zuñiga, F. (2024, October). 2025 EDUCAUSE Top 10 #3: Smoothing the student journey. *EDUCAUSE Review*. https://er.educause.edu/articles/2024/10/2025-educause-top-10-3-smoothing-the-student-journey

Google. (2025). *Gemini API pricing*. Google for Developers. https://ai.google.dev/pricing

Liu, F., He, X., Zhang, T., Chen, J., Li, Y., Yi, L., Zhang, H., Wu, G., & Shi, R. (2025). TickIt: Leveraging large language models for automated ticket escalation. In *Proceedings of the 33rd ACM International Conference on the Foundations of Software Engineering (FSE '25)*. https://doi.org/10.1145/3696630.3728558

MongoDB. (2025). *MongoDB Atlas pricing*. https://www.mongodb.com/pricing

OpenAI. (2025). *API pricing*. https://openai.com/api/pricing/

OWASP Foundation. (2021). *OWASP application security verification standard 4.0.3*. https://owasp.org/www-project-application-security-verification-standard/

Razma, A., & Jurkus, R. (2026). AI-based classification of IT support requests in enterprise service management systems. *Systems*, *14*(2), Article 223. https://doi.org/10.3390/systems14020223

Rumburg, J. (2018, March 20). Metric of the month: Tickets per user per month. *SupportWorld*. https://www.thinkhdi.com/library/supportworld/2018/metric-of-month-tickets-per-user-per-month

Salesforce. (2025). *Service Cloud pricing*. https://www.salesforce.com/products/service-cloud/pricing/

ServiceNow. (2025). *Pricing*. https://www.servicenow.com/lpgp/pricing.html

Shostack, A. (2014). *Threat modeling: Designing for security*. Wiley.

U.S. Department of Education. (2021). *Family Educational Rights and Privacy Act (FERPA)*. https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html

WASC Senior College and University Commission. (2026). *Statement of accreditation status: Westcliff University* [Accreditation status report]. https://www.wscuc.org/institutions/westcliff-university/?print=pdf

Windiatmoko, Y., Rahmadi, R., & Hidayatullah, A. F. (2021). Developing Facebook chatbot based on deep learning using RASA framework for university enquiries. *IOP Conference Series: Materials Science and Engineering*, *1077*(1), 012060. https://doi.org/10.1088/1757-899X/1077/1/012060
