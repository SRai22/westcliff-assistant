# IT Project Framework: From Academic Structure to Industry Practice

**Derived from CAP 690 – Masters Applied Capstone (Westcliff University)**
**Synthesized as a reusable framework for real-world IT project delivery**

---

## How to Use This Document

This framework distills the 5-phase academic capstone structure into an actionable, industry-standard playbook. Each phase maps to recognized frameworks (PMBOK, SDLC, Agile, ITIL) and describes what practitioners actually produce, not just what they conceptually do. Use this as both a writing guide for the capstone and as a reusable template for any IT project you lead in industry.

**The core insight:** The academic structure is not arbitrary — it mirrors how enterprise IT projects are actually approved, scoped, designed, delivered, and sustained. The capstone is training you to speak the language of IT leadership.

---

## The 5-Phase Model at a Glance

| Phase | Academic Name | Industry Equivalent | Primary Audience |
|-------|---------------|---------------------|------------------|
| 1 | Background, Business Justification & Introduction | Business Case / Project Charter | Executives / Steering Committee |
| 2 | Research & Recommendation | Solution Evaluation / ADRs | Architecture / IT Leadership |
| 3 | Project Design | Technical Design / Solution Architecture | Engineering / Project Team |
| 4 | Implementation Plan | Project Execution Plan | Project Manager / Delivery Team |
| 5 | Maintenance & Recommendations | Operations Runbook / Roadmap | IT Ops / Future Owners |

---

## Cross-Framework Mapping

Understanding where each phase sits within established frameworks lets you reference them credibly in both your capstone paper and professional documents.

| Phase | PMBOK Process Group | SDLC Phase | Agile Equivalent | ITIL Stage |
|-------|---------------------|------------|------------------|------------|
| 1 | Initiating | Feasibility & Requirements | Product Vision & Charter | Service Strategy |
| 2 | Planning (scope) | Analysis & Requirements Definition | Backlog Refinement / Capability Mapping | Service Design (options) |
| 3 | Planning (design) | System Design | Epic-to-Story Breakdown / Sprint 0 | Service Design (architecture) |
| 4 | Executing + Monitoring | Development, Testing, Deployment | Sprint Execution + Release Planning | Service Transition |
| 5 | Closing + Operations | Maintenance & Support | Continuous Improvement / Product Ops | Service Operation + CSI |

---

---

# PHASE 1 — Background, Business Justification & Project Introduction

## What This Phase Is

Phase 1 is the business case. You are asking an organization — and in the capstone, your instructor serving as the "executive" — to invest time, money, and organizational energy in solving a specific problem. Every sentence should answer one implicit question: **why should we do this, why now, and why your proposed approach?**

In industry, this phase produces the **Project Charter** — the formal document that authorizes a project to exist and commits organizational resources. Without it, nothing happens.

---

## What to Cover

### 1.1 Organizational Context
- Describe the organization: size, industry, mission, relevant structure
- Describe the relevant department or function where the problem lives
- Identify the business unit's goals, KPIs, or strategic objectives that are affected

> **Industry tip:** Frame the organization's current state in measurable terms — not "the process is slow" but "the help desk handles 400 tickets/week manually, consuming 120 staff-hours." Executives respond to numbers, not adjectives.

### 1.2 Problem Statement
- What is the specific problem? State it precisely.
- When did it start, and what caused it?
- Who is affected, and how? (staff, students, customers, leadership)
- What has the organization tried before, and why did it fall short?
- What does it cost the organization to leave this problem unsolved? (this is your burning platform)

> **Industry tip:** A strong problem statement is narrow. "Our IT systems are outdated" is not a problem statement. "Staff cannot access student support records from outside campus, causing an average 48-hour delay in case resolution and a 22% student satisfaction drop since 2023" is a problem statement.

### 1.3 Business Justification
This is where you make the financial and strategic case. Include:

**Quantitative benefits (measurable):**
- Cost savings (labor reduction, license consolidation, error reduction)
- Revenue or enrollment impact (if relevant)
- Productivity improvement (hours saved × loaded labor cost)
- Risk reduction (cost of a breach, fine, or audit failure avoided)

**Qualitative benefits (harder to measure but real):**
- Improved student or customer experience
- Staff morale and retention
- Regulatory compliance posture
- Competitive or reputational positioning

**Return on Investment (ROI):**
```
ROI = (Net Benefit / Total Cost) × 100
Payback Period = Total Project Cost / Annual Net Savings
```

Even a rough ROI calculation signals that you are thinking like a business leader.

### 1.4 Stakeholder Map
Every meaningful IT project touches people beyond the project team. Identify them early.

| Stakeholder | Role | Interest | Influence | Communication Frequency |
|-------------|------|----------|-----------|-------------------------|
| CTO / VP of IT | Executive Sponsor | Budget approval | High | Monthly steering |
| Department Head | Business Owner | Outcome quality | High | Weekly check-in |
| IT Operations | Implementers | Workload impact | Medium | Weekly during build |
| End Users | Adopters | Ease of use | Low-Med | At key milestones |
| Legal / Compliance | Reviewers | Risk mitigation | Med-High | At design review |

**RACI Matrix (Responsible / Accountable / Consulted / Informed):**
Use a RACI matrix for key decisions and deliverables. It prevents "who approved this?" debates later.

### 1.5 Proposed Solution (High-Level)
At Phase 1, you are not designing a solution — you are proposing that one exists. Cover:
- The class of solution (software implementation, process redesign, infrastructure upgrade, new system)
- What it would replace or augment
- Rough scope: which business functions, which users, which locations
- Preliminary timeline estimate (order of magnitude: 3 months? 12 months? 2 years?)
- Rough budget range (±50% accuracy is acceptable here)

### 1.6 Constraints and Assumptions
State what you know to be true (assumptions) and what limits your options (constraints):
- Budget ceiling
- Go-live deadline (contractual, regulatory, or strategic)
- Technology constraints (must integrate with existing systems, must use cloud, must be on-premise)
- Staffing constraints (limited internal capacity for implementation)

---

## Key Artifacts for Phase 1

- [ ] Executive summary (1–2 pages, plain language)
- [ ] Project charter (formal authorization document)
- [ ] Business case document (problem + proposed solution + ROI)
- [ ] Stakeholder register + RACI matrix
- [ ] Risk register — initial (top 5–10 risks with likelihood/impact ratings)
- [ ] High-level milestone timeline

---

## Risk Management at Phase 1

Focus on **strategic and organizational risks** — the kind that can kill a project before it starts:

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Executive sponsor changes roles | Medium | High | Document commitment in charter; identify backup sponsor |
| Budget not approved | Medium | Critical | Build ROI case; identify phased approach if needed |
| Problem scope not agreed upon | High | High | Stakeholder alignment workshop before charter sign-off |
| Organization not ready for change | Medium | High | Change readiness assessment; early communication plan |

---

## Compliance & Legal Considerations (Phase 1)

At Phase 1 you are identifying which regulatory domains your project touches. You don't need answers yet — you need to know which questions to ask.

| Regulation | Trigger | Your Action at Phase 1 |
|------------|---------|------------------------|
| GDPR | Handling personal data of EU residents | Identify DPO (Data Protection Officer), flag Privacy by Design requirement |
| HIPAA | Handling protected health information (PHI) | Flag BAA requirement with any vendors; include compliance cost in budget |
| FERPA | Student education records (US higher ed) | Identify what data the system will touch; add compliance review to stakeholder list |
| SOX | Financial transaction systems (public companies) | Add CFO to stakeholder register; identify audit trail requirements early |
| PCI-DSS | Payment card data | Scope payment systems carefully; involve payment processor in planning |
| NIST CSF | IT security baseline | Begin Identify phase: catalog assets and systems in scope |

---

---

# PHASE 2 — Research & Recommendation

## What This Phase Is

Phase 2 is the solution evaluation. You are showing that you did not jump to a conclusion — you considered multiple real options, applied consistent criteria, and arrived at a defensible recommendation. In industry, this is where **Architecture Decision Records (ADRs)** live and where bad decisions most commonly get made.

The failure mode here is confirmation bias: picking the answer first and working backward. A well-structured Phase 2 documents the process, not just the result.

---

## What to Cover

### 2.1 Requirements Definition

Before evaluating solutions, define what the solution must do and how well it must do it.

**Functional Requirements** — what the system must do:
- User workflows the system must support
- Data the system must store, process, or transmit
- Integrations with other systems required
- Reports or dashboards required
- Administrative functions (user management, configuration)

**Non-Functional Requirements** — quality attributes:

| Attribute | Definition | Example Requirement |
|-----------|------------|---------------------|
| Performance | Speed under load | Page loads in <2s for 95% of requests at 500 concurrent users |
| Availability | Uptime guarantee | 99.9% uptime (≤8.7 hours downtime/year) |
| Scalability | Growth headroom | Must support 5× current volume without re-architecture |
| Security | Protection controls | Data encrypted at rest (AES-256) and in transit (TLS 1.3) |
| Usability | Ease of use | Users complete core task in <3 clicks with no training |
| Compliance | Regulatory requirements | Must meet FERPA data handling requirements |
| Supportability | Operational manageability | Deployable within 4 hours; rollback in <1 hour |

**Requirements Traceability Matrix (RTM):**
Each requirement should ultimately trace forward to a design decision, a test case, and an acceptance criterion. Start this matrix in Phase 2.

### 2.2 Solution Options Analysis

Research a minimum of 3–4 distinct solution categories. In industry, these typically break down as:

| Option Type | Description | When It Makes Sense |
|-------------|-------------|---------------------|
| Commercial Off-the-Shelf (COTS) | Buy a vendor product | Requirements are standard; don't want to maintain code |
| Software as a Service (SaaS) | Cloud-hosted subscription | Lower IT overhead; faster to deploy; less control |
| Open Source | Community-maintained, self-hosted | Budget constraints; heavy customization needed; tech expertise available |
| Custom Build | Build from scratch internally or via contract | Unique requirements not met by any vendor; long-term strategic asset |
| Hybrid | COTS core + custom extensions | Most common in enterprise: buy the platform, build the differentiation |
| Do Nothing / Status Quo | Keep existing system | Sometimes the right answer — useful as baseline cost comparison |

For each option, research and document:
- What it is and how it works (2–3 paragraphs)
- Key features and capabilities
- Vendor/community support and track record
- Estimated 5-year Total Cost of Ownership (TCO)
- Known strengths and weaknesses in context of your requirements
- Reference customers or case studies

### 2.3 Decision Matrix

The decision matrix makes your recommendation transparent and reproducible. Anyone reading it should be able to follow your logic even if they disagree with the outcome.

**Criteria definition and weighting:**

| Criterion | Weight | Why It Matters |
|-----------|--------|----------------|
| Functional Fit | 35% | Does it do what we need? Gap analysis against requirements. |
| Technical Fit | 20% | Integration with existing systems; security posture; scalability |
| Total Cost of Ownership | 20% | 5-year cost, not just license fee |
| Vendor/Community Stability | 15% | Financial health, product roadmap, support quality |
| Implementation Risk | 10% | How hard is it to deploy? Organizational change burden? |

**Scoring scale:** 1 (very poor) → 5 (excellent)
**Weighted score:** criterion score × weight percentage

| Criterion | Weight | Option A | Option B | Option C |
|-----------|--------|----------|----------|----------|
| Functional Fit | 35% | 4 (140) | 3 (105) | 5 (175) |
| Technical Fit | 20% | 5 (100) | 4 (80) | 3 (60) |
| TCO | 20% | 3 (60) | 5 (100) | 2 (40) |
| Vendor Stability | 15% | 5 (75) | 4 (60) | 2 (30) |
| Implementation Risk | 10% | 4 (40) | 3 (30) | 2 (20) |
| **TOTAL** | 100% | **415** | **375** | **325** |

> The matrix is a tool, not a verdict. Your narrative must explain the weight choices and any qualitative factors the matrix cannot capture.

### 2.4 Recommendation

State your recommendation clearly, then justify it:
1. What you are recommending (specific solution/vendor/approach)
2. Why it scores best against your defined criteria
3. Any significant tradeoffs being accepted and why
4. What must be true for this recommendation to remain valid (assumptions)
5. What would cause you to reconsider (risk triggers)

---

## Architecture Decision Records (ADRs)

An ADR is a lightweight document that records an architectural decision, its context, and its consequences. Writing ADRs at Phase 2 creates an audit trail of why you chose what you chose — invaluable when someone asks "why did we do it this way?" two years later.

**ADR Template:**

```
TITLE: [Short noun phrase describing the decision]
DATE: [Decision date]
STATUS: [Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

CONTEXT:
What is the situation or problem that requires a decision?
What forces are at play? (requirements, constraints, goals, risks)
What options were considered?

DECISION:
What was decided, and why?

CONSEQUENCES:
+ What does this enable?
- What does this constrain or make harder?
~ What must now be addressed as a result?
```

**Example ADR for a student services system:**

```
TITLE: Use cloud-hosted SaaS ticketing system over custom-built solution
DATE: 2026-03-15
STATUS: Accepted

CONTEXT:
The department processes ~400 student support tickets/week across 10 categories.
Staff use 3 disconnected systems causing data silos and duplicate effort.
Budget ceiling: $150K Year 1, $60K/year ongoing.
IT team has no capacity to maintain a custom codebase.
No vendor meets 100% of requirements out-of-the-box.

DECISION:
Adopt Vendor X SaaS platform with lightweight custom integration for SSO.
Estimated 5-year TCO: $340K vs. $820K for custom build.

CONSEQUENCES:
+ Deployed in 8 weeks vs. 12-month custom build timeline
+ Vendor maintains platform; IT ops freed for other work
- Limited UI customization; some workflow steps require workarounds
~ SSO integration requires 3-week additional effort from IT team
~ Data migration from legacy system required (estimated 80 hours)
```

---

## Phase 2 Artifacts

- [ ] Requirements specification (functional + non-functional)
- [ ] Requirements traceability matrix (initial)
- [ ] Annotated bibliography (3–4 sources per solution option)
- [ ] Solution options analysis document (1–2 pages per option)
- [ ] Weighted decision matrix with rationale
- [ ] ADRs for key architectural choices
- [ ] Vendor RFI responses (if applicable)
- [ ] Updated risk register (solution-specific risks added)
- [ ] Recommendation memo (1 page executive summary)

---

---

# PHASE 3 — Project Design

## What This Phase Is

Phase 3 is where the recommendation becomes a blueprint. You are providing enough detail that someone could take this document and build what you are describing — or at minimum, scope the work accurately and price it reliably. In industry, this phase produces the **Technical Design Document (TDD)** or **Solution Design Document (SDD)**, and the detailed **Project Plan**.

The failure mode here is insufficient specificity — staying at the conceptual level when decisions have already been made. If you chose Option A in Phase 2, Phase 3 must specify how Option A will be configured, integrated, secured, and deployed.

---

## What to Cover

### 3.1 Solution Architecture

**System Architecture Diagram:**
Every technical project should include at minimum a logical diagram showing:
- Major system components (application, database, integrations, external services)
- Data flows between components
- Authentication and authorization boundaries
- Network zones (public internet, DMZ, internal network, data tier)

**Architecture Layers:**

| Layer | What Goes Here | Design Decisions to Make |
|-------|----------------|--------------------------|
| Presentation | UI / web app / mobile app | Framework choice, hosting, CDN, accessibility |
| Application | Business logic, APIs, services | Service decomposition, API design, stateless vs. stateful |
| Integration | Connections to external systems | Protocol (REST/SOAP/GraphQL), sync vs. async, error handling |
| Data | Databases, caches, file storage | Schema design, indexing strategy, backup approach |
| Infrastructure | Servers, containers, cloud services | Cloud vs. on-prem, redundancy, scaling strategy |

### 3.2 Security Architecture

Security is not a Phase 4 afterthought. It is designed here.

**Authentication & Authorization:**
- Who are the user personas? (students, staff, admins, external partners)
- How do they authenticate? (SSO, MFA, social login, local accounts)
- How is authorization enforced? (RBAC, ABAC, ACLs)
- Session management: how are sessions created, validated, and terminated?

**Data Protection:**
- Data classification: which data is public, internal, confidential, restricted?
- Encryption at rest: which database fields or file stores require encryption?
- Encryption in transit: TLS everywhere; which certificates and by whom?
- Data masking / anonymization: where does PII appear, and should it be masked?

**Threat Modeling (STRIDE):**
For each major component, consider:

| Threat Type | What It Means | Example in Your System |
|-------------|---------------|------------------------|
| Spoofing | Impersonating a user or system | Attacker logs in as another student |
| Tampering | Modifying data in transit or at rest | Ticket priority changed without authorization |
| Repudiation | Denying having performed an action | Staff denies approving a status change |
| Information Disclosure | Data exposed to unauthorized parties | Student A sees Student B's ticket |
| Denial of Service | Making system unavailable | Flood of requests crashes the intake API |
| Elevation of Privilege | Gaining unauthorized access level | Student accesses admin dashboard |

Mitigations for each threat should be documented and traced to specific design controls.

### 3.3 Integration Design

If your solution connects to other systems, define each integration precisely:

| Integration | Direction | Protocol | Frequency | Data Exchanged | Error Handling |
|-------------|-----------|----------|-----------|----------------|----------------|
| SSO (Google/SAML) | Inbound | OAuth 2.0 | On login | User identity token | Redirect to error page; log attempt |
| Email notifications | Outbound | SMTP / SendGrid API | On trigger events | HTML template + recipient | Queue with retry (3×, exponential backoff) |
| Student Record System | Inbound | REST API | On ticket create | Student ID lookup | Fallback to manual entry; alert ops |

### 3.4 Data Design

- **Entity Relationship Diagram (ERD)** or equivalent schema overview
- Key tables/collections and their relationships
- Primary key strategy (UUID vs. sequential ID vs. natural key)
- Indexing strategy (what queries will be slow without indexes?)
- Data retention policy (how long is each record type kept, and why?)
- Backup frequency and recovery approach

### 3.5 Detailed Budget

A Phase 3 budget is a **definitive estimate** (±10–15% accuracy), not an order of magnitude. Structure it as:

**One-Time Costs:**

| Category | Item | Qty | Unit Cost | Total |
|----------|------|-----|-----------|-------|
| Software | Vendor SaaS setup fee | 1 | $5,000 | $5,000 |
| Infrastructure | Cloud server (Year 1 provision) | 2 | $1,200/yr | $2,400 |
| Labor – Internal | Project manager (300 hrs) | 1 | $75/hr | $22,500 |
| Labor – Internal | Senior developer (500 hrs) | 2 | $85/hr | $85,000 |
| Labor – Vendor | Implementation consultant | 40 days | $1,500/day | $60,000 |
| Training | End-user training sessions | 4 | $2,000 | $8,000 |
| Contingency (12%) | — | — | — | $22,000 |
| **Total Year 1** | | | | **~$205,000** |

**Recurring Annual Costs:**

| Category | Item | Annual Cost |
|----------|------|-------------|
| Software | SaaS subscription (per user) | $18,000 |
| Infrastructure | Cloud hosting and storage | $4,800 |
| Support | Vendor support tier | $6,000 |
| Labor | IT support and administration (0.25 FTE) | $22,500 |
| **Total Annual** | | **~$51,300** |

**5-Year TCO: ~$410,000**

### 3.6 Work Breakdown Structure (WBS)

Decompose the project into phases → deliverables → work packages → tasks. Even a partial WBS in the capstone demonstrates you understand how projects are scoped.

```
PROJECT
├── Phase 1: Project Initiation
│   ├── Kickoff meeting and stakeholder alignment
│   ├── Environment provisioning
│   └── Project management tooling setup
├── Phase 2: Configuration & Build
│   ├── Core system configuration
│   │   ├── User roles and permissions
│   │   ├── Workflow and category setup
│   │   └── Notification templates
│   ├── Integrations
│   │   ├── SSO integration
│   │   └── Email service integration
│   └── Custom development (if any)
├── Phase 3: Testing
│   ├── Unit and integration testing
│   ├── User Acceptance Testing (UAT)
│   └── Performance and security testing
├── Phase 4: Training & Change Management
│   ├── Staff training (administrators)
│   ├── End-user training (students)
│   └── Documentation and runbook
└── Phase 5: Deployment & Go-Live
    ├── Production deployment
    ├── Data migration
    └── Post-launch hypercare (2-week intensive support)
```

---

## Phase 3 Artifacts

- [ ] System architecture diagram (logical + physical)
- [ ] Security design document (auth, authz, threat model, controls)
- [ ] Integration specification (per integration)
- [ ] Data model / ERD
- [ ] Detailed project plan (WBS + schedule with critical path)
- [ ] Resource plan (who does what, when)
- [ ] Detailed budget (one-time + recurring + 5-year TCO)
- [ ] Quality management plan (test strategy, acceptance criteria)
- [ ] Updated risk register (technical risks added with mitigations)

---

---

# PHASE 4 — Implementation Plan

## What This Phase Is

Phase 4 bridges design and reality. A project can be brilliantly designed and still fail in execution. The implementation plan answers: **in what order does everything happen, who does each piece, how will we know it is working, and what do we do when something breaks?**

In industry, this phase produces the **Project Execution Plan**, **Sprint Plan** (Agile), **Deployment Plan**, and **Test Plan**.

---

## What to Cover

### 4.1 Project Schedule

**Gantt Chart or Sprint Plan:**
A well-structured schedule shows:
- Task name and description
- Start and end dates
- Dependencies (what must finish before this can start)
- Owner (who is responsible)
- Milestone markers (major checkpoints, decision gates)

**Critical Path:**
The critical path is the longest sequence of dependent tasks that determines the earliest possible finish date. Any delay on the critical path delays the project. Identify it explicitly.

**Schedule Buffers:**
- Build 10–20% buffer into the schedule explicitly — do not hide it inside individual tasks
- Define schedule risk thresholds: "If UAT slips by >2 weeks, trigger contingency plan X"

**Typical IT Project Schedule Pattern:**

| Phase | Typical Duration | Activities |
|-------|-----------------|------------|
| Project Initiation | 1–2 weeks | Kickoff, environments, access provisioning |
| Configuration / Development | 8–16 weeks | Core build; iterative for Agile |
| Integration | 2–4 weeks | Connect to other systems; end-to-end testing |
| User Acceptance Testing (UAT) | 3–6 weeks | Business users validate against requirements |
| Training & Change Management | 2–4 weeks | Parallel with late UAT |
| Go-Live Preparation | 1–2 weeks | Final checks, cutover plan, data migration rehearsal |
| Production Deployment | 1–3 days | Deployment window, smoke tests, go/no-go |
| Post-Launch Hypercare | 2–4 weeks | Intensive support, daily check-ins |

### 4.2 Agile Sprint Breakdown (if Agile)

If your project uses an Agile approach, show how the work is structured into sprints:

| Sprint | Duration | Goals | Key Stories | Definition of Done |
|--------|----------|-------|-------------|---------------------|
| Sprint 1 | 2 weeks | Foundation | User auth, core data model, CI/CD pipeline | Deployed to dev; automated tests pass |
| Sprint 2 | 2 weeks | Core features | Ticket creation flow, category routing | Feature-complete; UAT test cases written |
| Sprint 3 | 2 weeks | Integrations | SSO, email notifications | Integration tests pass; security scan clean |
| Sprint 4 | 2 weeks | Polish + UAT | Bug fixes, accessibility, performance | All P1/P2 defects resolved; stakeholder sign-off |

### 4.3 Testing Strategy

Testing is not an afterthought — it is planned in Phase 3 and executed in Phase 4.

| Test Type | What It Validates | Who Performs It | Entry Criteria | Exit Criteria |
|-----------|------------------|-----------------|----------------|---------------|
| Unit Testing | Individual components work correctly | Developers | Code complete | ≥80% code coverage; 0 failures |
| Integration Testing | Components work together | Developers / QA | Unit tests pass | All integration flows verified |
| System Testing | End-to-end functionality | QA Team | Integration tests pass | All test cases executed; major defects resolved |
| Performance Testing | System handles expected load | QA / DevOps | System tests pass | Meets performance NFRs under 2× expected load |
| Security Testing | Vulnerabilities identified and remediated | Security / QA | System tests pass | No critical/high CVSS findings unresolved |
| User Acceptance Testing (UAT) | Business requirements are met | Business Users | System tests pass | ≥95% test cases passed; sponsor sign-off |
| Regression Testing | Changes don't break existing functionality | QA | Each code change | Automated regression suite passes |

**Defect Severity Levels:**

| Severity | Definition | Resolution SLA |
|----------|------------|----------------|
| Critical (P1) | System down; data loss; security breach | Immediate; same-day fix |
| High (P2) | Major feature broken; significant workflow blocked | Within 24 hours |
| Medium (P3) | Feature degraded; workaround exists | Within sprint |
| Low (P4) | Minor UI issue; cosmetic | Next release |

### 4.4 Deployment / Cutover Plan

The moment of go-live is the highest-risk moment of any project. Plan it in detail:

1. **Pre-Deployment Checklist:**
   - All P1/P2 defects resolved
   - Rollback plan tested and documented
   - Stakeholder sign-off obtained
   - Communications sent to users (at least 48 hours in advance)
   - Support team briefed and ready

2. **Deployment Steps (example):**
   - T-24h: Freeze code; final backup of production data
   - T-4h: Begin maintenance window (users notified)
   - T-3h: Database migration executed and validated
   - T-2h: Application deployed and smoke-tested
   - T-1h: Data migration (if applicable) executed and validated
   - T-0h: System opened to users; hypercare team on standby
   - T+4h: Initial health check; go/no-go decision documented

3. **Rollback Criteria:**
   - Define clearly: what conditions trigger rollback? (e.g., P1 defect within 2 hours, data integrity issue)
   - Rollback procedure must be rehearsed, not planned-for-the-first-time during an incident

### 4.5 Change Management & Training

Technology projects fail far more often from people not adopting the new system than from technical failures. Plan for this.

**Change Management Activities:**

| Activity | Timing | Audience | Purpose |
|----------|--------|----------|---------|
| Executive communication | Before Phase 3 | All staff | Build awareness and buy-in |
| Department champion identification | Phase 3 | Power users per team | Create internal advocates |
| Training needs assessment | Phase 3 | All user groups | Identify skill gaps |
| Train-the-trainer sessions | 4 weeks pre-launch | Champions / super users | Cascade training internally |
| End-user training | 2 weeks pre-launch | All users | Build confidence; reduce launch-day issues |
| Quick reference guides / job aids | At launch | All users | On-the-job support |
| Feedback mechanism | 30/60/90 days post-launch | All users | Continuous improvement |

---

## Phase 4 Artifacts

- [ ] Detailed project schedule (Gantt or sprint plan)
- [ ] Resource allocation plan (named individuals, % time, period)
- [ ] Test plan (test types, entry/exit criteria, environments)
- [ ] Cutover / deployment plan
- [ ] Rollback plan
- [ ] Training plan and materials outline
- [ ] Communication plan (what, to whom, when)
- [ ] Risk register (updated with execution-phase risks)
- [ ] Change control process (how scope changes are evaluated and approved)

---

---

# PHASE 5 — Ongoing Maintenance & Recommendations

## What This Phase Is

A project is not done at go-live. The decisions made here — about who owns the system, how it is monitored, how incidents are handled, and what comes next — determine whether the investment made in Phases 1–4 keeps delivering value or quietly decays.

In industry, this phase produces the **Operations Runbook**, **Service Level Agreement (SLA)**, **Incident Response Plan**, and **Product Roadmap**.

---

## What to Cover

### 5.1 Operational Ownership

Define clearly who owns what:

| Domain | Owner Role | Responsibilities |
|--------|-----------|-----------------|
| Application Support (Tier 1) | Help Desk | User account issues, basic troubleshooting, escalation |
| Application Administration | System Administrator | Configuration, user management, patches, upgrades |
| Infrastructure / Hosting | IT Operations / Cloud Team | Server health, storage, backups, networking |
| Security Operations | IT Security | Monitoring, vulnerability scanning, incident response |
| Product Evolution | Product Owner / Business Owner | Feature requests, roadmap, vendor relationship |

### 5.2 Monitoring Strategy

If you cannot observe it, you cannot manage it. Define:

**What to monitor:**

| Layer | Metrics | Alert Threshold | Alert Recipient |
|-------|---------|-----------------|-----------------|
| Application | Response time, error rate, throughput | >2s p95 latency; >1% error rate | On-call engineer |
| Database | Query performance, connection pool, storage growth | >80% disk utilization; query timeout | DBA |
| Infrastructure | CPU, memory, network | >85% sustained for >5 min | IT Ops |
| Security | Failed login attempts, unusual data access | >10 failed logins in 5 min from one IP | Security team |
| Business | Ticket volume, SLA compliance, resolution time | SLA breach threshold | Department manager |

**Observability Stack (common tooling):**
- Application Performance Monitoring: Datadog, New Relic, Dynatrace
- Log Aggregation: Splunk, ELK Stack (Elasticsearch + Logstash + Kibana), CloudWatch
- Uptime Monitoring: PagerDuty, UptimeRobot
- Security: SIEM (Splunk, QRadar, Sentinel), WAF

### 5.3 Incident Response Plan

Define how incidents are classified and handled:

**Incident Severity Levels:**

| Level | Definition | Response Time | Resolution Time | Escalation |
|-------|------------|---------------|-----------------|------------|
| P1 – Critical | System down; data loss; breach | 15 min | 4 hrs | CTO immediately |
| P2 – High | Major feature unavailable; significant user impact | 1 hr | 24 hrs | IT Manager |
| P3 – Medium | Degraded functionality; workaround available | 4 hrs | 72 hrs | Team lead |
| P4 – Low | Minor issue; cosmetic | Next business day | Next release | Standard queue |

**Incident Response Lifecycle:**
1. **Detect** — Monitoring alert or user report
2. **Triage** — Assess severity; assign owner; notify stakeholders
3. **Contain** — Isolate affected components; prevent spread
4. **Investigate** — Root cause analysis (RCA)
5. **Resolve** — Apply fix; restore service
6. **Post-Mortem** — Document: what happened, why, what we're doing to prevent recurrence
7. **Close** — Update runbook; close ticket; communicate resolution

> **Blameless post-mortems** are industry best practice. The goal is to fix systems and processes, not to assign fault to individuals. This encourages honest reporting.

### 5.4 Disaster Recovery (DR) and Business Continuity

Define your recovery objectives and the procedures to meet them:

| Term | Definition | Example |
|------|------------|---------|
| RTO (Recovery Time Objective) | Maximum tolerable downtime | System must be restored within 4 hours |
| RPO (Recovery Point Objective) | Maximum acceptable data loss | No more than 1 hour of data may be lost |
| Backup Frequency | How often data is backed up | Database: hourly incremental, daily full |
| Backup Retention | How long backups are kept | 30 days rolling |
| DR Test Frequency | How often DR plan is rehearsed | Annually, with tabletop exercises quarterly |

### 5.5 Security Operations & Compliance Maintenance

Security is not a one-time implementation — it is ongoing:

- **Patch management**: Define SLAs for applying OS, application, and dependency patches (e.g., critical patches within 48 hours)
- **Vulnerability scanning**: Frequency, tooling, remediation SLAs
- **Access reviews**: Quarterly review of who has access to what; remove stale accounts
- **Penetration testing**: Annual third-party pentest; remediate findings by severity
- **Compliance audits**: Annual review of FERPA/HIPAA/SOX compliance controls (as applicable)
- **Security training**: Annual mandatory security awareness training for all users

### 5.6 Maintenance Cost Planning

Ongoing maintenance costs are consistently underestimated. Budget explicitly for:

| Category | Typical Annual % of Initial Project Cost |
|----------|------------------------------------------|
| Vendor license / subscription | Fixed per contract |
| Infrastructure operations | 8–15% |
| Application support labor | 10–20% |
| Enhancements and minor features | 15–25% |
| Security and compliance activities | 5–10% |
| **Total ongoing** | **~38–70% per year** |

### 5.7 Future Roadmap & Recommendations

A project's conclusion is a natural inflection point for strategic thinking. Address:

- What was intentionally deferred from this project scope and why?
- What new capabilities would deliver the next increment of value?
- What technical debt was incurred that should be addressed next?
- What organizational capabilities need to be built or hired?
- What is the recommended next phase, with rough scope and timeline?

Frame this as a brief product roadmap:

| Horizon | Timeframe | Theme | Key Initiatives |
|---------|-----------|-------|-----------------|
| Now | 0–3 months | Stabilization | Post-launch defect fixes; adoption support |
| Next | 3–12 months | Enhancement | Mobile interface; reporting dashboard; workflow automation |
| Later | 12–24 months | Expansion | AI-assisted routing; integrations with external student systems |

---

## Phase 5 Artifacts

- [ ] Operations runbook (monitoring, incident response, common procedures)
- [ ] SLA / service level document
- [ ] DR/BCP plan
- [ ] Patch management policy
- [ ] Access review schedule
- [ ] Maintenance budget (annual)
- [ ] Future roadmap (3 horizons: Now / Next / Later)
- [ ] Lessons learned document (what went well, what to do differently)

---

---

# CROSS-CUTTING CONCERNS

These topics appear in every phase. Treat them as lenses you apply throughout the project, not checkboxes you complete once.

---

## Risk Management

**Risk Register Structure:**

| Field | Description |
|-------|-------------|
| Risk ID | Unique identifier (R-001, R-002...) |
| Category | Technical / Schedule / Budget / Organizational / Compliance / Vendor |
| Description | Clear statement of what could go wrong |
| Likelihood | 1–5 (1 = rare, 5 = almost certain) |
| Impact | 1–5 (1 = negligible, 5 = project failure) |
| Risk Score | Likelihood × Impact |
| Owner | Named individual responsible for monitoring and response |
| Response Type | Avoid / Transfer / Mitigate / Accept |
| Mitigation Action | Specific steps to reduce likelihood or impact |
| Contingency | What to do if risk materializes despite mitigation |
| Status | Open / In Progress / Closed |

**Risk Response Strategies:**

| Strategy | Meaning | When to Use |
|----------|---------|-------------|
| Avoid | Change the plan to eliminate the risk | Risk is unacceptably high; alternative exists |
| Transfer | Shift risk to another party (insurance, contract clause) | Risk is financial or operational; vendor better placed to manage |
| Mitigate | Reduce likelihood or impact | Most common; risk cannot be eliminated but can be reduced |
| Accept | Acknowledge risk and monitor | Risk is low-impact or too costly to address |

---

## Stakeholder Communication

The best technical solution fails if people don't know about it, understand it, or trust it. Communication is not a soft skill — it is a project management discipline.

**Communication Matrix:**

| Audience | Message | Channel | Frequency | Owner |
|----------|---------|---------|-----------|-------|
| Executive Sponsor | Budget status, risk escalations, milestone achieved | 1:1 meeting or written report | Monthly | Project Manager |
| Steering Committee | Overall project health (schedule/budget/risk dashboard) | Slide deck or dashboard | Monthly |Project Manager |
| Department Managers | How their teams are affected; preparation needed | Email + department meeting | At milestones | Business Analyst |
| End Users | What is changing, when, what they need to do | Email + intranet post + training invite | 6 weeks, 2 weeks, 1 week pre-launch | Change Manager |
| IT Team | Technical decisions, task assignments, blockers | Daily standup / project board | Daily during execution | Tech Lead |

**Communication anti-patterns to avoid:**
- Over-communicating details to executives (they want status, not blow-by-blow)
- Under-communicating to end users until the last minute (change resistance is the result)
- Communicating bad news late (trust erodes when surprises surface at escalation)

---

## Total Cost of Ownership (TCO)

TCO is the full cost of ownership over a defined period (typically 5 years), not just the purchase price or Year 1 spend. It exists to prevent decisions that look cheap initially but cost more in the long run.

**TCO Formula:**
```
TCO = Initial Implementation Costs
    + (Annual Operating Costs × Years)
    + End-of-life Migration Costs (if applicable)
    - Avoided Costs (replaced systems, manual labor eliminated)
```

**Why TCO Matters for Solution Selection:**
- A SaaS solution at $50K/year vs. an on-premise solution at $200K upfront + $15K/year:
  - Year 1: SaaS cheaper ($50K vs. $215K)
  - Year 5: SaaS cumulative $250K vs. on-premise $275K — roughly equal
  - Year 10: On-premise cheaper if no major refresh needed
  - But: on-premise requires IT staff to maintain; SaaS includes vendor support
  - Break-even analysis should include all factors

---

## Compliance and Regulatory Landscape

IT projects in any industry involving personal data, financial transactions, student records, or healthcare data carry compliance obligations. These are not optional and are not the responsibility of a compliance officer alone — engineers and architects must design with them in mind.

**Key frameworks summary:**

| Framework | Scope | Key Obligations | Penalty for Non-Compliance |
|-----------|-------|-----------------|---------------------------|
| GDPR | Personal data of EU residents | Consent, data subject rights, breach notification (72 hrs), data minimization | Up to €20M or 4% global annual revenue |
| FERPA | Student education records (US) | Access controls, parental rights transfer at 18, disclosure restrictions | Loss of federal funding |
| HIPAA | Protected health information (US) | Data encryption, access logging, BAA with vendors, breach notification | $100–$50,000 per violation |
| SOX | Financial reporting (US public cos) | IT controls, audit trails, access controls for financial systems, change management | Criminal charges for executives |
| PCI-DSS | Payment card data | Encryption, access control, vulnerability scanning, penetration testing | Fines from card networks; loss of processing rights |
| NIST CSF | General IT security (widely adopted) | Identify, Protect, Detect, Respond, Recover functions | Not legally binding; widely required by contracts |

**Design Principles for Compliance:**
- **Privacy by Design**: Build data protection into architecture from Phase 1, not as a retrofit
- **Data Minimization**: Collect only what is needed for the stated purpose
- **Least Privilege**: Users and services have only the access they need for their function
- **Audit Trails**: Every significant action on sensitive data is logged with who/what/when
- **Right to Erasure**: Where applicable, design data deletion pathways from the start

---

---

# QUICK REFERENCE: MASTER DELIVERABLES CHECKLIST

Use this as a tracker for your capstone or any real project.

## Phase 1 Deliverables
- [ ] Executive summary (1–2 pages)
- [ ] Problem statement with quantified baseline
- [ ] Business case with ROI analysis
- [ ] Stakeholder register + RACI matrix
- [ ] Initial risk register (top 5–10 risks)
- [ ] Project charter
- [ ] Preliminary timeline and budget range

## Phase 2 Deliverables
- [ ] Functional and non-functional requirements
- [ ] Requirements traceability matrix (initial)
- [ ] Annotated bibliography (3–4 sources per option)
- [ ] Solution options analysis (3–4 options)
- [ ] Weighted decision matrix with rationale
- [ ] Architecture Decision Records (1–3 key decisions)
- [ ] Recommendation memo with justified rationale
- [ ] Updated risk register

## Phase 3 Deliverables
- [ ] System architecture diagram
- [ ] Security design document (auth, authz, threat model)
- [ ] Integration specifications
- [ ] Data model / ERD
- [ ] Work Breakdown Structure (WBS)
- [ ] Detailed project schedule
- [ ] Detailed budget (Year 1 + 5-year TCO)
- [ ] Quality management plan
- [ ] Updated risk register

## Phase 4 Deliverables
- [ ] Project schedule (Gantt or sprint plan)
- [ ] Resource allocation plan
- [ ] Test plan with entry/exit criteria
- [ ] Deployment / cutover plan
- [ ] Rollback plan
- [ ] Training plan and materials outline
- [ ] Communication plan
- [ ] Change management plan
- [ ] Change control process

## Phase 5 Deliverables
- [ ] Operations runbook
- [ ] SLA / service level document
- [ ] Monitoring and alerting design
- [ ] Incident response plan
- [ ] Disaster recovery / BCP plan
- [ ] Security operations procedures
- [ ] Annual maintenance budget
- [ ] Future roadmap (Now / Next / Later)
- [ ] Lessons learned document

---

---

# APPLYING THIS FRAMEWORK TO REAL PROJECTS

The 5-phase structure is not just academic — it is the backbone of every major IT initiative you will encounter in industry, whether waterfall, Agile, or hybrid. The names change; the substance does not.

**In a startup or small team**, you compress the phases:
- Phase 1 might be a single 1-page problem statement and a Slack decision thread
- Phases 2–3 might be a one-hour architecture discussion with ADRs in a GitHub wiki
- Phase 4 is a GitHub project board
- Phase 5 is a runbook.md in the repo

**In a mid-size enterprise**, phases map roughly to the structure here.

**In a large enterprise or government project**, each phase may span months with its own governance gate, steering committee review, and formal document approval.

The judgment call is always the same: **how much rigor does the risk warrant?** A $50K internal tool needs far less formality than a $5M patient-record system. Calibrate the overhead to the stakes — but never skip the thinking, even if you skip the paperwork.

---

*Framework synthesized from CAP 690 Masters Applied Capstone syllabus, Westcliff University College of Technology & Engineering, mapped to PMBOK, SDLC, Agile, ITIL, NIST, and enterprise IT delivery practice.*
