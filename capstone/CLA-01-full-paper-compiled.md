# AI-Powered Student Services Portal: A Comprehensive Project Plan for Westcliff University

---

> **APA 7 Cover Page (format in Word/Docs)**
>
> AI-Powered Student Services Portal: A Comprehensive Project Plan for Westcliff University
>
> [Your Full Name]
> Westcliff University
> CAP 690: Masters Applied Capstone
> [Professor Name]
> April 2026

---

## Executive Summary

Westcliff University's current student services model places the entire burden of institutional navigation on the student. Across ten departmental support categories, students must independently identify the correct office, locate its contact channel, and submit a request with sufficient context for staff to act on it — with no intelligent guidance, no cross-departmental routing mechanism, and no shared visibility for the institution into request volume, accuracy, or resolution time. The result is a system that generates misrouted requests, delays initial responses, and produces no data to support staffing decisions, resource allocation, or accreditation reporting.

This report presents a comprehensive plan for the design, implementation, and ongoing operation of an AI-Powered Student Services Portal built specifically for Westcliff University. The proposal has advanced through five structured phases — background analysis, research synthesis, system design, implementation planning, and maintenance strategy — culminating in a deployed, production-ready system.

**The Solution.** The portal provides a conversational AI intake interface through which students describe their issue in plain language. The system classifies the request into the appropriate department, generates a pre-populated support ticket, and surfaces relevant knowledge base articles for self-service resolution — all without requiring the student to navigate Westcliff's departmental structure. Staff access a centralized Kanban dashboard with AI-assisted tools for ticket summarization, draft response generation, and next-step recommendations. All AI-generated content requires explicit staff review and approval before it is transmitted to any student.

**The Evidence.** Three bodies of peer-reviewed research support this approach. Razma and Jurkus (2026), in a study of 150,441 enterprise support tickets, found that automated triage achieves 92–95% accuracy and processes each ticket in under 10 milliseconds — eliminating the manual steps identified as the "most time-consuming and error-prone" in any support operation. Liu et al. (2025) documented a 39% reduction in mean time to repair and estimated savings of ten analyst person-days per day following production deployment of a comparable LLM-powered system across 20,000+ tickets. Page and Gehlbach (2017) found in a randomized field experiment at Georgia State University that AI-assisted pre-enrollment outreach produced a statistically significant 3.3 percentage point increase in on-time enrollment among committed students — representing a 21% reduction in summer melt — with substantially reduced burden on university staff. These are not theoretical projections; they are production-validated results from comparable operational environments.

**The Financial Case.** The custom-built portal carries a Year 1 implementation cost of approximately $27,159 — covering development labor, cloud hosting, database infrastructure, and LLM API access — with an annual recurring cost of approximately $5,059. This compares to a conservative lower-bound estimate of $310,000 over three years for the most economical enterprise alternative (ServiceNow), and $260,000 for Salesforce Student Success. Staff triage-time savings alone — estimated at $38,500 per year beginning in Year 2, based on EDUCAUSE benchmarking data and published labor rates — generate a positive net present value by the end of Year 3. LLM API costs represent less than 2% of total recurring costs even under worst-case volume scenarios, making the budget resilient to provider pricing changes.

**The Compliance Posture.** Student data is stored exclusively in an institutionally controlled database. The AI service receives only the text of a student's issue description and has no database access, no credentials, and no path to student records — eliminating the sub-processor chain risk that enterprise platforms introduce under FERPA. A complete audit trail of every ticket action supports institutional accountability and regulatory documentation requirements.

**Recommendation.** University leadership is advised to authorize production deployment of the AI-Powered Student Services Portal, beginning with a four-week pilot in one high-volume department — Student Accounts or Information Technology — followed by phased expansion across all ten service categories. The system is built, tested, and ready for deployment. No further design work is required to proceed.

---

## Table of Contents

- Executive Summary
- Table of Contents
- List of Tables
- List of Figures
- Chapter 1: Background, Business Justification, and Project Introduction
  - Introduction
  - Organizational Background
  - Problem Statement
  - Quantifying the Problem
  - Proposed Solution
  - Business Justification
  - Conclusion and Recommendation
- Chapter 2: Research Synthesis and Recommendation
  - Research Synthesis
  - Recommendation
  - Decision Criteria and Weighted Analysis
  - Business Justification and Financials
  - Risk and Responsibility
- Chapter 3: Project Design
  - Solution Architecture
  - Data Model
  - Security Architecture and Governance
  - AI-Powered Triage Engine
  - User Interface Design
  - Project Budget
- Chapter 4: Implementation Plan
  - Project Schedule
  - Sprint Descriptions
  - Deployment Architecture
  - Testing Strategy
  - Staff Training Plan
  - Change Management and Rollout
- Chapter 5: Ongoing Maintenance and Recommendations
  - Operational Maintenance
  - Monitoring and Cost Controls
  - Disaster Recovery
  - Future Roadmap
  - Residual Risks
- Final Conclusion
- References

---

## List of Tables

- Table 1: Weighted Decision Matrix
- Table 2: Stakeholder Value Map
- Table 3: Primary Data Entities and Their Roles
- Table 4: Threat Analysis and Mitigation Controls (STRIDE Framework)
- Table 5: Annual Ticket Volume Scenarios
- Table 6: Annual LLM API Cost by Provider and Volume Scenario
- Table 7: Estimated Project Costs: Year 1 and Recurring Annual
- Table 8: Three-Year TCO of the proposed project
- Table 9: Implementation Schedule — Development Sprints and Production Deployment
- Table 10: Disaster Recovery Procedures by Component

---

## List of Figures
- Figure 1:  3 year financial projection for Custom Build vs Enterprise Alternative
- Figure 2: Three-Service Architecture of the AI Assisted Student Services Portal 
- Figure 3: Conversational AI Intake Process Data Flow
- Figure 3: Student Intake — Conversational Triage Interface
- Figure 4: Staff Dashboard: Kanban Ticket Management
- Figure 5: Staff Ticket Detail: AI Assist Panel

---

---

# Chapter 1: Background, Business Justification, and Project Introduction

## AI-Powered Student Services Portal: A Business Case for Westcliff University

---

## Introduction

Higher education institutions are under increasing pressure to deliver student services that are fast, accurate, and accessible — particularly as enrollment grows and student expectations evolve alongside consumer technology. At Westcliff University, students seeking administrative support must independently determine which of ten service categories in the university's support portal handles their particular issue, locate the appropriate contact channel, submit a request, and then wait for a response. This process places the burden of institutional navigation entirely on the student, creates significant delays when requests are misrouted, and produces no systematic data for institutional reporting or continuous improvement.

This paper presents a business case for an AI-powered Student Services Portal designed specifically for Westcliff University. The proposed system replaces the current fragmented intake model with a unified, conversational AI interface that classifies student issues automatically, routes requests to the appropriate department, and provides staff with AI-assisted tools to improve response quality and resolution time. The purpose of this document is to provide executive leadership with the organizational context, problem analysis, and preliminary justification necessary to approve advancement of this proposal into formal design and implementation phases.

---

## Organizational Background

Westcliff University is an accredited private institution offering undergraduate and graduate programs across business, technology, and education disciplines. According to federal institutional data maintained by the National Center for Education Statistics, Westcliff reported an undergraduate full-time equivalent (FTE) enrollment of 1,906 and a graduate FTE of 4,618 as of its most recent reporting cycle, reflecting a student body that is heavily graduate-oriented and includes a substantial proportion of international students (IPEDS, 2022; WSCUC, 2026). The university maintains multiple instructional locations and delivers programs through both on-site and distance education modalities, adding logistical complexity to student services delivery.

Student support at Westcliff is currently organized across ten service categories within the university's official support portal: Information Technology, Learning Technologies, International Affairs, Registrar, Student Accounts, Financial Aid, Alumni Affairs and Career Services, Military and Veterans Services, Student Life, and a catch-all Resolution Center (Westcliff University, n.d.). Each category operates its own contact channels, response protocols, and issue scope. Additional functional units — including Student Services and the Learning Experience Design (LXD) Team — operate outside the portal entirely, meaning students seeking help from those areas have no structured intake path at all. There is no centralized intake mechanism that spans all support functions or provides students with intelligent guidance on where to direct their requests.

This structural fragmentation is not unique to Westcliff. Woelert (2023) describes administrative burden in higher education as a systemic organizational problem arising from coordination complexity across professional and departmental domains — a challenge that intensifies as institutions grow in size and programmatic diversity. The absence of unified intake infrastructure is therefore both a Westcliff-specific operational gap and a recognized sector-wide challenge.

---

## Problem Statement

The current student services intake model at Westcliff is built on self-directed navigation. Students experiencing an administrative issue must identify the correct department, locate the appropriate contact method, and submit a request with sufficient context for staff to process it. Each of these steps introduces a point of failure: students misidentify the correct department, submit requests with insufficient information, or disengage from the help-seeking process entirely when the path forward is unclear.

The structural consequences of this model have been documented in the literature. Gibson (2022) examined the organizational divide between faculty and student services staff across multiple institutional sites and found that siloed professional roles and fragmented communication channels consistently prevent the kind of integrated, coordinated support that students — particularly those managing complex, cross-departmental issues — require.

The impact on students is measurable. Collier-Tenison and Polk-Hampton (2024) documented that in a support system serving approximately 3,000 students, students who encountered navigation barriers were significantly less likely to follow through on help-seeking, not because the support did not exist, but because accessibility and routing clarity were insufficient. The study reported that 779 referrals were processed over a two-year evaluation period — and that responsiveness targets of 24-hour initial contact were used as a standard precisely because delays in initial response were known to reduce student engagement with the support process. At Westcliff's enrolled scale, comparable navigation and responsiveness gaps represent a significant unaddressed operational risk.

---

## Quantifying the Problem

The operational cost of the current model can be understood across three dimensions: volume, accuracy, and timeliness.

On volume, EDUCAUSE (2016) benchmarking data for U.S. higher education institutions reported median annual help desk contact rates of approximately 1.0 interaction per institutional FTE via phone and 0.5 via email, with IT help desk staffing at a median of 0.9 FTE per 1,000 institutional FTEs. Applied conservatively to Westcliff's enrolled population, this implies a substantial volume of student service interactions per academic year that are currently handled through unstructured, manual intake processes with no shared visibility across departments.

On accuracy, Al-Hawari and Barham (2021) examined IT service desk operations and demonstrated that manual ticket classification and routing produces significant misclassification, which they quantified through machine learning experiments showing that baseline routing accuracy without intelligent classification hovered around 53.8%. Misrouted requests require reprocessing, generate additional back-and-forth between students and staff, and extend resolution timelines — all of which represent direct labor cost and indirect satisfaction cost to the institution. Razma and Jurkus (2026) similarly documented that in an enterprise service management environment processing over 87,000 multilingual support tickets, the two manual triage steps — request type determination and responsible team assignment — were explicitly identified as "the most time-consuming and error-prone tasks," with the study's stated goal being to automate these steps in order to reduce triage time, minimize misclassifications, and free help-desk staff to focus on problem resolution.

On timeliness, the consequences of slow responses are not theoretical. Collier-Tenison and Polk-Hampton (2024) found that a 24-hour initial contact window was treated as a critical operational threshold — not as an aspirational standard, but because delays beyond it were known to reduce student engagement with the support process. Students who do not hear back quickly do not keep waiting. They disengage. At Westcliff's scale, with no centralized intake system and no shared visibility across departments, there is no reliable mechanism to ensure that threshold is consistently met — or even to know when it has been missed.

---

## Proposed Solution

The proposed AI-Powered Student Services Portal addresses each dimension of the documented problem through a unified, intelligent intake system built specifically for Westcliff's departmental structure and student population.

The system is organized around three core components. First, a conversational AI intake interface replaces the current model of self-directed departmental navigation. Students describe their issue in plain language through a chat interface. The AI classifies the issue into the appropriate support category — mapping to all of Westcliff's existing portal categories plus the units currently excluded from the portal — asks targeted clarifying questions to gather the information needed for resolution, and generates a structured support ticket with a pre-populated summary, description, and priority level. Students are also surfaced relevant Knowledge Base articles at the point of intake, enabling self-service resolution for common issues before a ticket is formally submitted.

Second, a staff-facing Kanban dashboard provides centralized visibility across all departments and all ticket statuses. Staff can view, assign, and update tickets, and access AI-assisted tools — including conversation summarization, draft response generation, and recommended next-step suggestions — to improve the quality and efficiency of their responses. All AI-generated content is presented as a draft requiring staff review and approval before it is transmitted to a student. No AI output is delivered automatically.

Third, the system maintains a complete audit trail of all ticket activity, status changes, and AI interactions, supporting institutional reporting, compliance documentation, and continuous service improvement.

This solution is not a generic platform retrofit. It is purpose-built for Westcliff, with authentication restricted to institutional Google accounts, category taxonomy mapped to Westcliff's actual department structure, and data architecture designed to comply with FERPA and applicable data privacy requirements.

---

## Business Justification

The business case for this system rests on four value propositions that map directly to Westcliff's operational and strategic priorities.

**Operational efficiency.** Automating the intake, classification, and routing functions currently performed manually by staff reduces labor time per ticket and eliminates the rework associated with misrouted requests. Page and Gehlbach (2017) demonstrated in a randomized field experiment that an AI virtual assistant supporting students through complex pre-enrollment administrative tasks — transcript submission, financial aid holds, orientation registration — produced a statistically significant 3.3 percentage point increase in on-time enrollment, translating to a 21% reduction in summer melt, while requiring substantially reduced staff burden compared to prior counselor-based interventions of similar scale. The efficiency gains are not marginal; they compound across every ticket, every semester, at institutional scale.

**Student satisfaction and retention.** Westcliff's enrolled population is predominantly graduate — with a graduate FTE of 4,618 compared to an undergraduate FTE of 1,906 (IPEDS, 2022) — and includes a significant proportion of international students whose support needs frequently involve time-sensitive, high-stakes issues such as visa documentation, I-20 corrections, and financial aid disbursement. For this population, a delayed or misrouted support request is not merely an inconvenience; it can carry academic, financial, and immigration consequences. Amoako et al. (2023) found through regression analysis of 400 university students that administrative service quality, academic service quality, and physical evidence were all statistically significant components of perceived service quality with a positive relationship to student satisfaction — establishing that how well an institution delivers its administrative services directly shapes how students evaluate their overall experience. Wong and Chapman (2022) added a further dimension, finding that satisfaction with student support services was among the lower-rated satisfaction dimensions across their study population, suggesting that universities consistently underperform on support delivery relative to other experience dimensions even when students are otherwise satisfied. Taken together, this body of research positions improved support delivery not as a quality-of-life enhancement but as a measurable retention mechanism — and for an institution where graduate tuition revenue is the financial foundation, every student who disengages from support services due to friction represents a compounding institutional risk.

**Data and institutional intelligence.** The current intake model produces no systematic data. Students navigate to whichever department they believe is correct, submit a request through whatever channel that department uses, and the interaction disappears into a siloed inbox with no cross-departmental visibility. There is no record of total support volume, no tracking of how often requests are misrouted, and no structured data available for institutional reporting. Gaftandzhieva et al. (2023) documented that higher education institutions remain significantly underutilizing data analytics in administrative decision-making, explicitly identifying the gap between data availability and actual data use as a structural disadvantage for institutions that lack these systems. Komljenovic et al. (2024) similarly found through empirical fieldwork at universities that fragmented, siloed administrative data prevents institutions from producing the business intelligence needed for informed staffing and resource decisions. The proposed portal addresses this gap directly — capturing request volume by department, resolution time by category, recurring issue types, and knowledge base utilization rates into a structured dataset that supports staffing decisions, resource allocation, and accreditation reporting in ways the current model is architecturally incapable of providing.

**Scalability.** Under the current model, the intake burden falls on two parties simultaneously. Students must navigate the portal, determine which of ten categories applies to their issue — with no guidance when their problem spans more than one department — and submit a request with enough context for staff to act on it. Staff, in turn, must review each incoming request, verify it arrived in the correct department, and often redirect it before work can even begin. This dual-sided friction means the system does not just consume staff time — it also consumes student time and introduces failure points at every handoff. As enrollment grows, both sides of this burden scale proportionally: more students generating requests means more navigation failures, more misrouted tickets, and more staff effort spent on intake rather than resolution. An AI-assisted model breaks this pattern. The intake intelligence handles classification and initial triage automatically, students receive an immediate response regardless of which department they would have chosen, and staff time is concentrated on resolution rather than routing. Growth in enrollment does not require a proportional increase in administrative workload.

---

## Chapter Summary

The current student services intake model at Westcliff University is a structural liability. It places navigation burden on students, produces misrouted and delayed requests, generates no institutional data, and scales poorly with enrollment growth. The research evidence confirms that these are not minor inconveniences — they have measurable effects on student satisfaction, institutional loyalty, and the effective use of staff capacity.

The proposed AI-Powered Student Services Portal addresses each of these issues directly, through a system already designed, prototyped, and demonstrated to work in Westcliff's specific institutional context. The chapters that follow document the research foundation, system design, implementation process, and operational maintenance plan for this solution.

---

---

# Chapter 2: Research Synthesis and Recommendation

## AI-Powered Student Services Portal: A Business Case for Westcliff University

---

## Chapter 2: Research Synthesis and Recommendation

The business case established in Chapter 1 identified three operational failures — misrouted requests, delayed responses, and the absence of institutional data — that the proposed portal is designed to address. This chapter examines the research literature supporting the proposed solution, evaluates credible alternatives through a weighted decision process, and documents the financial and risk case required for executive review.

### Research Synthesis

The following synthesis draws from the annotated bibliography developed in the prior phase of this project, supplemented by additional peer-reviewed and practitioner literature identified through subsequent research. The body of literature reviewed for this proposal converges on three evidence-based themes directly applicable to Westcliff University's institutional context: (1) the documented maturity ceiling of early AI approaches in higher education and the production-validated superiority of large language model (LLM) systems; (2) the structural limitations of enterprise student services platforms currently dominant in the market; and (3) quantified empirical evidence that automating manual intake triage produces measurable operational and financial returns at scale.

**Theme 1: AI Maturity in Higher Education — From Fixed Taxonomy to Production LLM**

The literature on AI-assisted student services spans a meaningful generational divide. Windiatmoko et al. (2021) represent the preceding generation of chatbot implementations: a Facebook Messenger assistant for student enquiries at a university in Indonesia, built on a rules-based conversational framework with 14 hard-coded categories of recognized questions. Under controlled evaluation conditions, the system achieved a weighted F1-score of 0.98 for intent classification — a composite measure of accuracy and completeness in correctly categorizing requests, where 1.0 is a perfect score — a result that appears strong in isolation but reflects the fundamental constraint of the architecture. Every new query type requires manually labeled training data, new dialogue scripts, and full model retraining. The system was never deployed in live operation at the time of publication; real-world usability metrics including task completion rates and handling of out-of-scope queries were not measured (Windiatmoko et al., 2021). This limitation is not a flaw in the study's execution — it is the inherent ceiling of any fixed-taxonomy approach applied to the open-ended variability of student language.

Liu et al. (2025) document what became possible once that ceiling was removed. TickIt, deployed in production at ByteDance's Volcano Engine cloud platform from August through December 2024, processes support tickets using a large language model — an AI system trained on natural language — replacing static, pre-programmed categories with the ability to understand and classify requests expressed in ordinary language. Across 20,000+ tickets and 654,901 messages over five months, TickIt achieved an F1-score of 0.862, outperforming all prompt-engineering-only baselines and the best smaller-model classifier (F1 = 0.801) by 7.6% (Liu et al., 2025). The operational result of this improvement was a 39% reduction in mean time to repair (MTTR) and a saving of an estimated ten person-days of analyst effort per day. The gap between Windiatmoko et al. (2021) and Liu et al. (2025) is not merely technical — it is the difference between a research prototype with an unmeasured deployment outcome and a production system with validated institutional impact.

**Theme 2: Enterprise Platform Alternatives — Reactive Infrastructure Without Intelligent Intake**

Czechowski et al. (2024), writing for EDUCAUSE Review — the practitioner journal of the primary professional association for higher education information technology in North America — identified "smoothing the student journey" as the third-ranked institutional technology challenge for 2025, citing persistent service fragmentation across disconnected portals and departments as the defining operational problem. The article documents institutional investment in three dominant enterprise platforms: ServiceNow, Salesforce Student Success, and Workday Student. Each is positioned as a systems-of-record and case-management solution designed to consolidate student service data. However, the authors draw an explicit distinction between reactive and proactive service delivery: reactive systems respond to requests after students initiate contact, while proactive systems use predictive analytics and cross-departmental data access to reach students before issues escalate (Czechowski et al., 2024). The central finding relevant to this proposal is that enterprise platform adoption alone does not resolve the underlying coordination failure when departments continue to operate in data silos — the technology cannot compensate for the absence of intelligent, cross-departmental intake classification. This is the structural argument that positions an AI-native custom portal not as a lower-tier alternative to enterprise software, but as a categorically different solution: one that treats LLM-based triage as the architectural foundation rather than a configurable add-on. EDUCAUSE Review operates through editorial rather than blind peer review; this source is appropriately classified as a practitioner report and is used here for sector-level context, not for performance or cost claims.

**Theme 3: Automation ROI — Empirical Evidence at Operational Scale**

Razma and Jurkus (2026) provide the closest peer-reviewed empirical analogue to the operational context at Westcliff University. Their study applies NLP-based machine learning to automate ticket triage in a real enterprise IT service management (ITSM) environment, using a dataset of 150,441 historical support tickets drawn from a single organization's on-premises SQL database. The study explicitly documents that the two manual triage steps — determining request type and assigning the responsible resolution team — are "the most time-consuming and error-prone tasks" in the support ticket lifecycle (Razma & Jurkus, 2026, p. 2). This characterization is not offered as opinion; it is the stated operational motivation for the research, drawn from the organization's own service management records. The proposed AI triage system in this proposal directly targets the same bottleneck.

The performance results are actionable. Advanced AI language models achieved accuracy scores of 0.920 for request type classification and 0.952 for team assignment on a 1.0 scale — meaningfully higher than simpler baseline approaches (0.80 and 0.87, respectively) — while processing each ticket in under 10 milliseconds, confirming that the system is fast enough for real-time student intake (Razma & Jurkus, 2026). The structural parallel to Westcliff's context is direct: the study's dataset spans eleven responsible teams, one more than Westcliff's ten student service departments, and nine request type categories, mirroring the scope of the proposed portal's classification taxonomy. Critically, the transformer model's advantage over simpler classifiers was most pronounced on rare and semantically complex categories — specifically, a 166% F1 improvement over logistic regression for the lowest-frequency category (Razma & Jurkus, 2026). This finding is operationally significant for Westcliff: the departments most likely to receive misrouted student requests — Military and Veterans Services, International Affairs, the Resolution Center — are precisely the low-frequency, high-consequence categories where baseline routing fails most severely.

---

### Recommendation

Based on the weighted evaluation of available alternatives against documented institutional requirements, this proposal recommends that Westcliff University proceed with the deployment of the AI-Powered Student Services Portal as a custom-built, AI-native system.

**What the System Delivers.** The portal provides a single, unified intake interface through which students describe their issue in plain language. The system classifies the request into the appropriate department, surfaces relevant knowledge base articles to enable self-service resolution where applicable, and generates a structured, pre-populated support ticket for staff review. Staff access a centralized Kanban-style dashboard with AI-assisted tools for summarization, draft response generation, and next-step recommendations. All AI-generated content requires staff review and approval before transmission to students. A complete audit trail of all ticket activity supports institutional reporting and compliance documentation.

**How It Operates.** The system routes student requests across all ten of Westcliff's existing portal service categories. Authentication is restricted to verified institutional accounts, ensuring that access control is enforced at the system level. The data architecture is designed for FERPA compliance and institutional data jurisdiction: student data does not flow through third-party vendor systems without explicit legal basis.

**Strategic Fit.** Westcliff University's institutional identity centers on access, student success, and personalized support — particularly for its graduate-majority student body and substantial international student population. For this population, a delayed or misrouted support request is not an inconvenience; it carries real academic, financial, and immigration consequences. The proposed portal directly addresses this alignment gap: it treats intelligent, responsive intake as a strategic service investment, not an operational overhead. No generic enterprise platform provides this alignment by default; the strategic fit is achievable only through a purpose-built system mapped to Westcliff's specific departments, enrollment profile, and institutional values.

---

### Decision Criteria and Weighted Analysis

The following decision matrix evaluates four realistic alternatives across five weighted criteria. Criteria weights reflect the institutional priorities identified in the research synthesis and Westcliff's operational constraints. Each alternative is scored on a five-point scale (1 = lowest suitability, 5 = highest suitability).

**Table 1**

*Weighted Decision Matrix: Student Services Platform Selection*

| Criteria | Weight | Custom Build | ServiceNow | Salesforce Student Success | Workday Student |
|---|:---:|:---:|:---:|:---:|:---:|
| **Total Cost of Ownership (3-year)** | 25% | 5 | 2 | 2 | 1 |
| **AI-native triage capability** | 25% | 5 | 2 | 2 | 1 |
| **FERPA / data jurisdiction compliance** | 25% | 5 | 3 | 3 | 2 |
| **Westcliff fit and customizability** | 15% | 5 | 2 | 2 | 1 |
| **Operational readiness / time to deploy** | 10% | 5 | 1 | 1 | 1 |
| **Weighted Score** | **100%** | **5.00** | **2.15** | **2.15** | **1.25** |

*Note.* Vendor pricing for ServiceNow, Salesforce, and Workday is not publicly available; cost scores derive from EDUCAUSE (2022) benchmarking data reporting median higher education ERP implementation costs of $10–$50 million, with annual licensing at 15–25% of total cost of ownership. AI-native triage scores reflect capability classification from Czechowski et al. (2024). Compliance scores reflect sub-processor chain complexity for enterprise platforms relative to on-premise institutional control.

**Feasibility Assessment.** Applying the four-lens evaluation framework — assessing technical, operational, financial, and scheduling feasibility — the custom build receives a feasibility score of 9 out of 10. The system has been designed and prototyped within an 8-week development window, meeting the project scope requirement established at the outset of this proposal. Enterprise alternatives receive feasibility scores of 3–4 out of 10, reflecting documented 12–18 month implementation timelines for ServiceNow and Salesforce deployments and multi-year transformation programs for Workday Student (Czechowski et al., 2024).

---

### Business Justification and Financials

**Stakeholder Value Map**

The following table identifies who receives value from the proposed portal, the nature of that value, and when it materializes. Stakeholder value maps demonstrate that the investment rationale has been evaluated across institutional roles, not solely from an operational efficiency perspective.

**Table 2**

*Stakeholder Value Map — AI-Powered Student Services Portal*

| Stakeholder | Value Received | Timeline |
|---|---|---|
| **Students** | Immediate routing accuracy, 24-hour-or-better initial response, self-service article access at point of intake, no departmental navigation burden | Year 1 (deployment) |
| **Student Services Staff** | Elimination of manual triage tasks documented as "most time-consuming and error-prone" (Razma & Jurkus, 2026); AI-assisted draft responses reducing composition time per reply; centralized cross-department ticket visibility | Year 1 (partial); Year 2 (full) |
| **Department Directors** | Cross-departmental visibility into ticket volume, category distribution, and resolution time; structured data for staffing and resource allocation decisions; complete audit trail for compliance reporting | Year 1 (partial); Year 2 (full) |
| **Executive Leadership / CFO** | Quantified staff-time savings compounding year-over-year; avoided enterprise licensing costs; institutional data supporting accreditation and student success reporting; positive net present value (NPV) realized by end of Year 3 | Year 2 (break-even); Year 3 (positive ROI) |
| **Finance / Compliance** | FERPA-compliant architecture with institutional data jurisdiction; no third-party sub-processor chain for student record data; full audit log supporting regulatory review | Year 1 (ongoing) |

**Three-Year Financial Projection**

The financial case for this proposal rests on two parallel models: (1) quantified staff-time savings from automating manual triage, and (2) total cost of ownership delta relative to the most economical enterprise alternative.

*Model 1 — Staff-Time Savings.* Razma and Jurkus (2026) document that manual triage — request type determination and team assignment — is the primary time cost per ticket in enterprise ITSM environments. Applied to Westcliff's scale, using a conservative estimate of 6,500 student service requests per academic year (derived from EDUCAUSE [2016] benchmarking data at 1.0–1.5 contacts per institutional FTE annually, applied to Westcliff's total enrollment of approximately 6,524 FTE), and a conservative average manual triage time of 10 minutes per ticket (consistent with Razma & Jurkus, 2026), the gross annual triage burden approximates 1,083 staff-hours. At a loaded hourly rate of $28 — consistent with the mid-range of support staff compensation of $45,000–$55,000 annually (Bureau of Labor Statistics, 2024b) — annual triage-cost savings from full automation reach approximately $30,333. Including estimated rework from misrouted tickets (approximately 18% misroute rate, 25 minutes per reprocessed ticket), total recoverable staff-hour value reaches approximately $38,500 per year beginning in Year 2. Page and Gehlbach (2017) independently confirmed that AI-assisted administrative systems at comparable institutional scale produced measurable efficiency gains and a 21% reduction in administrative failure rates, providing external validation of this projection class.

*Model 2 — Avoided Enterprise Licensing.* EDUCAUSE (2022) benchmarking data for mid-size higher education institutions reports median ERP implementation costs of $10–$50 million, with annual licensing at 15–25% of total cost of ownership. Even scaled to a smaller-enrollment institution, a ServiceNow or Salesforce Student Success deployment carries a Year 1 implementation investment conservatively estimated at $400,000–$600,000, with annual licensing costs of $80,000–$150,000 thereafter. The custom build's Year 1 cost — covering production deployment, infrastructure provisioning, staff training, and LLM service integration — is estimated at $65,000–$75,000, with annual operational costs of approximately $21,000 in subsequent years.

**Table 3**

*Three-Year Financial Projection — Custom Build vs. Enterprise Alternative*

| | Year 1 | Year 2 | Year 3 |
|---|:---:|:---:|:---:|
| Custom build: implementation & deployment | ($70,000) | — | — |
| Custom build: annual operational costs | — | ($21,000) | ($21,000) |
| Staff triage savings (full automation) | — | $38,500 | $38,500 |
| Cost delta vs. enterprise implementation | $430,000+ | — | — |
| Cost delta vs. enterprise annual licensing | — | $59,000+ | $59,000+ |
| **Net annual position vs. enterprise alternative** | **$360,000+** | **$76,500+** | **$76,500+** |
| **Cumulative 3-year position** | | | **$513,000+** |

*Note.* Enterprise licensing costs derived from EDUCAUSE (2022). Staff savings modeled from Razma and Jurkus (2026) and Bureau of Labor Statistics (2024b). A 7% discount rate applied to staff savings yields a positive NPV by the conclusion of Year 3. Year 1 represents net investment; Year 2 represents break-even; Year 3 represents positive ROI with compounding staff savings dividend.

**Brand Alignment.** Westcliff University's stated institutional mission emphasizes student-centered service delivery, accessibility across modalities, and outcomes-driven education — values that the current fragmented intake model structurally undermines. An AI-powered portal does not merely reduce operational overhead; it makes the university's service infrastructure responsive to the population it serves. For Westcliff's graduate-majority enrollment — a population with professional expectations, time-constrained schedules, and in many cases international student compliance requirements — the quality of administrative service delivery is not separable from the institution's overall value proposition. Research in higher education service quality consistently identifies administrative responsiveness as a direct driver of student retention and institutional reputation (Teeroovengadum et al., 2019). The proposed portal is, in this respect, a brand investment as much as an operational one.

---

### Risk and Responsibility

**Risk That Cannot Be Eliminated**

Every engineering and process control described in this proposal reduces identified risks; none eliminates them. The following three residual risks represent irreducible exposures that persist after the system is fully deployed and all mitigations are in place. Executive leadership must account for these in governance planning.

*Residual Risk 1 — LLM Hallucination and FERPA Exposure.* Large language models can generate plausible but inaccurate outputs — including erroneous policy guidance regarding financial aid eligibility, registration deadlines, or visa documentation requirements. When inaccurate AI output reaches a student, the institutional consequences may include financial harm, academic disruption, or immigration compliance failure. The proposed system mitigates this risk by requiring mandatory staff review of all AI-generated content before delivery to students; no AI output is transmitted automatically. However, staff review under workload pressure cannot guarantee detection of all inaccurate outputs, and this residual risk is not eliminable through technical controls alone (Razma & Jurkus, 2026; U.S. Department of Education, PTAC, 2012).

*Residual Risk 2 — Cyberattack and Data Breach.* Higher education institutions are among the most targeted sectors for ransomware and credential-theft attacks. Verizon (2024) reports that social engineering was the leading attack pattern in the educational services sector, accounting for 42% of confirmed breaches — underscoring that phishing, credential misuse, and insider threat represent the primary residual threat to institutional systems, a vulnerability category that technical architecture cannot eliminate. EDUCAUSE (2023) identified institutional cybersecurity as a top-three challenge for higher education in 2025. A custom-built system reduces the risk of third-party platform vulnerabilities but introduces the institution as the primary security perimeter holder. Credential theft, session hijacking, or social engineering of staff with administrative access represent residual attack vectors that survive encryption, access controls, and intrusion detection.

*Residual Risk 3 — Environmental Cost of LLM Inference.* Production deployment of a large language model accumulates measurable energy consumption and associated carbon emissions at every inference call. Strubell et al. (2019) quantified the energy cost of training large NLP models, and Patterson et al. (2022) extended this analysis to production inference at scale. At Westcliff's request volume, the environmental footprint is modest in absolute terms but non-zero and accumulates over time. No business justification eliminates this cost; it must be acknowledged and, where possible, offset through selection of compute providers with documented renewable energy commitments.

**Legal and Ethical Compliance**

This proposal implicates two primary compliance frameworks.

*FERPA.* The Family Educational Rights and Privacy Act governs all institutional handling of student education records, including the student support data this system collects, processes, and stores. The proposed architecture addresses FERPA requirements through institutional-domain-only authentication, on-premise or institutionally controlled data storage, and audit trail logging of all access events. Enterprise platforms that process student data through third-party infrastructure require designation of the vendor as a "school official" with legitimate educational interest — a legal posture that introduces sub-processor chain risk (U.S. Department of Education, PTAC, 2012). The custom-built architecture avoids this exposure entirely.

*ADA / Section 508 Accessibility.* The system's student-facing intake interface must conform to Web Content Accessibility Guidelines (WCAG 2.1 Level AA) to ensure equitable access for students with disabilities — a compliance obligation under the Americans with Disabilities Act and Section 508 of the Rehabilitation Act. Accessibility conformance must be validated prior to production deployment and maintained through ongoing interface updates.

*Ethical Framing.* The system does not make autonomous decisions affecting student records, financial aid, or academic standing. All AI outputs require human review. This design principle is not a limitation — it is the ethical boundary required to operate AI-assisted services responsibly in an educational context where consequential decisions must remain within institutional accountability structures.

---

---

# Chapter 3: Project Design

## AI-Powered Student Services Portal: A Business Case for Westcliff University

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

The system's persistent data is organized into six primary entities, each designed to enforce a specific domain rule. Table 4 summarizes the entity structure and purpose.

**Table 4**

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

**Threat Mitigation.** Table 5 identifies the primary threat categories applicable to this system, following the STRIDE threat modeling framework originally developed by Microsoft for identifying security threats in software systems (Shostack, 2014), and documents the specific design controls that mitigate each threat.

**Table 5**

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

The budget estimates below are derived from Westcliff University's reported enrollment of 6,524 full-time equivalent students — 1,906 undergraduate and 4,618 graduate (WSCUC, 2026) — and from published pricing for each infrastructure component.

**Ticket Volume Assumptions.** Annual ticket volume drives the LLM API cost, which is the only usage-based expense. Table 6 presents three scenarios adapted from IT service desk benchmarking data reporting 0.5–1.4 tickets per user per month across industries (Rumburg, 2018), discounted to reflect student services contacts rather than full IT support volume.

**Table 6**

*Annual Ticket Volume Scenarios*

| Scenario | Contacts per Student per Semester | Annual Tickets (6,524 FTE × 2 semesters) | LLM API Calls (4 per ticket) |
|---|:---:|---:|---:|
| Best case | 0.5 | ~6,500 | ~26,000 |
| Median case | 1.0 | ~13,000 | ~52,000 |
| Worst case | 1.5 | ~19,500 | ~78,000 |

Each ticket generates an estimated four LLM API calls: one triage classification (~2,600 input tokens), one follow-up refinement (~2,100 input tokens), and two staff-assist calls — summarize (~1,500 input tokens) and draft reply (~1,700 input tokens). These estimates are derived from the actual prompt template sizes implemented in the system. Output tokens average approximately 500 per call across all endpoints, reflecting the structured JSON response format.

**LLM API Cost Calculation.** Table 7 estimates annual LLM costs for two providers at their published per-token rates.

**Table 7**

*Annual LLM API Cost by Provider and Volume Scenario*

| Provider | Input Rate (per 1M tokens) | Output Rate (per 1M tokens) | Best Case (26K calls) | Median (52K calls) | Worst Case (78K calls) |
|---|---:|---:|---:|---:|---:|
| OpenAI GPT-4o | $2.50 | $10.00 | $260 | $520 | $780 |
| OpenAI GPT-4o-mini | $0.15 | $0.60 | $16 | $31 | $47 |
| Google Gemini 2.0 Flash | $0.10 | $0.40 | $10 | $21 | $31 |

*Note.* Pricing sourced from OpenAI (2025) and Google (2025) published API rate cards. Per-call cost formula: (2,000 avg input tokens × input rate) + (500 output tokens × output rate). The 2,000-token input average reflects a weighted mean across the four call types per ticket derived from the implemented prompt templates. GPT-4o-mini and Gemini Flash are suitable for structured classification tasks and represent the cost-optimized configuration; GPT-4o is included as the upper bound for applications requiring higher reasoning capability.

The system's provider abstraction layer allows the institution to select the most cost-effective model for each task. A practical configuration would use a cost-optimized model (GPT-4o-mini or Gemini Flash) for high-volume triage calls and reserve the more capable model for complex assist tasks, yielding a blended annual cost well below the GPT-4o figures.

**Infrastructure and Labor Costs.** Table 8 presents the full project budget across three scenarios. Infrastructure costs are fixed regardless of ticket volume; only LLM API costs vary.

**Table 8**

*Estimated Project Costs: Year 1 and Recurring Annual*

| Category | Item | Source | Year 1 Cost | Annual Recurring |
|---|---|---|---:|---:|
| Development | Developer labor (~400 hours at $65/hour) | Bureau of Labor Statistics, 2024a | $26,000 | — |
| Hosting | Cloud VM (2 vCPU, 4 GB RAM) | DigitalOcean, 2025 | $288 | $288 |
| Database | MongoDB Atlas M10 (dedicated cluster) | MongoDB, 2025 | $840 | $840 |
| LLM API (median) | GPT-4o-mini / Gemini Flash blended | OpenAI, 2025; Google, 2025 | $31 | $31 |
| LLM API (worst case) | GPT-4o at full volume | OpenAI, 2025 | $780 | $780 |
| Authentication | Google OAuth 2.0 (free tier) | Google, 2025 | $0 | $0 |
| Maintenance | Staff developer (~5 hours/month at $65/hour) | Bureau of Labor Statistics, 2024a | — | $3,900 |
| **Total (best/median)** | | | **$27,159** | **$5,059** |
| **Total (worst case)** | | | **$27,908** | **$5,908** |

*Note.* Developer hourly rate based on the Bureau of Labor Statistics median wage for software developers (SOC 15-1252) of $65.04 as of May 2023, the most recent published data (Bureau of Labor Statistics, 2024a). Cloud hosting estimate based on DigitalOcean basic droplet pricing at $24/month. MongoDB Atlas M10 pricing at approximately $70/month on AWS us-east-1 (MongoDB, 2025).

**Three-Year Total Cost of Ownership.** Table 9 compares the three-year TCO of the custom-built portal against the enterprise alternatives evaluated in Chapter 2.

**Table 9**

*Three-Year Total Cost of Ownership Comparison*

| | Custom Build (median) | Custom Build (worst case) | ServiceNow | Salesforce Student Success |
|---|---:|---:|---:|---:|
| Year 1 | $27,159 | $27,908 | $150,000+ | $120,000+ |
| Year 2 | $5,059 | $5,908 | $80,000+ | $70,000+ |
| Year 3 | $5,059 | $5,908 | $80,000+ | $70,000+ |
| **3-Year Total** | **$37,277** | **$39,724** | **$310,000+** | **$260,000+** |

*Note.* Enterprise platform estimates are based on published per-agent licensing rates (ServiceNow, 2025; Salesforce, 2025) and the general finding that enterprise ITSM platforms carry implementation and integration costs that are prohibitive for smaller institutions (Czechowski et al., 2024). Exact vendor pricing is sales-assisted and varies by institutional agreement; the figures above represent conservative lower-bound estimates.

The custom-built solution costs approximately 12–15% of the enterprise alternatives over three years. This cost advantage derives from three structural factors: the absence of per-user or per-agent licensing fees, the use of open-source software for all application components, and the dramatically low marginal cost of LLM API calls relative to the per-seat pricing model of enterprise ITSM platforms. Notably, LLM API costs — the component most subject to pricing uncertainty — represent less than 2% of the total recurring cost even in the worst-case scenario, making the budget resilient to provider price fluctuations.

---

---

# Chapter 4: Implementation Plan

## AI-Powered Student Services Portal: A Business Case for Westcliff University

---

## Chapter 4: Implementation Plan

With the design documented in Chapter 3 fully specified, this chapter describes how that design was brought into existence. The implementation followed an Agile Software Development Life Cycle (SDLC), organized into six sequential sprints each targeting a discrete layer of the architecture. Agile's iterative, sprint-based structure is well-suited to systems with interdependent components, as it allows each layer to be validated before dependent work begins — reducing integration risk and enabling course correction without full project restarts. Alami and Krancher (2022) found through case study analysis that Scrum's time-boxed sprint cycles generate measurable quality advantages specifically because formal inspection points — sprint reviews and retrospectives — ensure defects are identified and resolved within each increment rather than accumulating across the full project. The chapter documents the project schedule, deployment model, testing strategy, staff training plan, and phased rollout approach for production.

### Project Schedule

Table 10 presents the implementation schedule across all six development sprints and the planned production deployment phase. Sprint durations reflect the actual time required to complete each layer of the system and the dependency relationships between components.

**Table 10**

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

The system is packaged as a four-service Docker Compose application — frontend, backend API gateway, AI service, and MongoDB database — launchable with a single command on any environment with Docker installed. Containerization encapsulates each service with its dependencies into an isolated, portable unit, producing an identical runtime across development, staging, and production without host-level software installation — directly addressing the environment-parity problem common to distributed microservices architectures (Kithulwatta et al., 2022). This approach reduces the operational burden on a small institutional IT team and eliminates environment-specific configuration drift between development and production deployments. Each service runs in an isolated container: the AI service can be scaled or restarted independently of the gateway and frontend, and taken offline entirely without affecting core ticket management. The DigitalOcean virtual machine specified in the Chapter 3 budget is the target production host.

### Testing Strategy

The system's testing approach follows a layered strategy matching test type to risk level, consistent with defense-in-depth principles for secure software verification (OWASP Foundation, 2021). Backend API endpoints are covered by integration tests that verify authentication enforcement, RBAC behavior, ticket lifecycle transitions, and AI proxy connectivity. These tests execute against a real database instance, not a simulated one, ensuring that test results reflect actual persistence behavior rather than mock assumptions — a critical distinction for systems where authorization logic must be validated at the data layer. Frontend components are covered by unit and integration tests using Vitest and React Testing Library, focusing on user interactions, state management, and API client behavior. AI service response schemas are validated by Pydantic at the service boundary, providing runtime enforcement that the language model's output conforms to the expected structure before it reaches the API gateway or the client.

### Staff Training Plan

**Training Audiences.** Two distinct staff audiences require training prior to production use. The first audience is student services staff who will manage tickets through the Kanban dashboard on a daily basis. The second audience is the designated IT administrator responsible for system configuration, environment variable management, and first-line incident response.

**Staff Track: Kanban Dashboard and AI Assist.** Student services staff require competency in four areas: (1) navigating the Kanban board — filtering tickets by status and department, understanding the New → In Progress → Waiting → Resolved status progression, and using dropdown status updates; (2) managing ticket detail — reading conversation history, adding staff replies, distinguishing internal notes (visible only to staff) from student-facing messages; (3) using the AI Assist panel — invoking Summarize, Draft Response, and Suggest Next Steps; understanding that all AI-generated output requires staff review and approval before it is sent to a student; and (4) ticket assignment and escalation — assigning tickets to specific staff members and using the Waiting status for tickets pending student follow-up.

Delivery format: a one-hour live walkthrough session conducted by the implementing developer or a trained department lead, followed by a one-page quick reference card covering the most common workflows. Training is completed before the pilot launch and repeated for each department cohort as the rollout expands.

**IT Administrator Track.** The administrator requires familiarity with the Docker Compose command set for starting, stopping, and updating services; environment variable configuration for LLM provider selection and API key management; MongoDB Atlas backup verification and restore procedure; and the Google OAuth application configuration in Google Cloud Console for credential rotation. This training is delivered as a documented runbook rather than a live session, allowing the administrator to reference it independently during routine maintenance and incident response.

### Change Management and Rollout

Production deployment will follow a phased rollout strategy designed to validate the system under real operational conditions before full institutional adoption. Díaz-Garcia et al. (2023) found through case study analysis of digital transformation in a higher education institution that successful IT adoption requires phased implementation aligned to actual stakeholder needs, dedicated communication channels to reduce resistance, and a deliberate strategy for cultural change — findings that directly support a pilot-first rollout model. A single-department pilot produces visible results, surfaces friction points before they affect all ten departments, and builds the institutional credibility needed to sustain broader adoption. In the pilot phase (Weeks 12–14), the system will be activated for a single high-volume department — Student Accounts or Information Technology — selected for their ticket throughput and staff readiness. Pilot staff will use the system exclusively for all new student requests during this window, with the implementing team available for immediate support. Feedback will be collected through structured weekly check-ins covering triage accuracy, AI assist usefulness, and any workflow friction points.

Following a four-week pilot period, feedback findings will be reviewed and any critical issues resolved before expansion. Remaining departments will be onboarded in cohorts of two to three over the following four to six weeks, until all ten student service departments are active. This graduated approach limits the operational risk of a full simultaneous cutover and allows training delivery to be sequenced rather than conducted as a single large event.

---

---

# Chapter 5: Ongoing Maintenance and Recommendations

## AI-Powered Student Services Portal: A Business Case for Westcliff University

---

## Chapter 5: Ongoing Maintenance and Recommendations

The implementation plan documented in Chapter 4 brings the system into production. This chapter addresses what happens next. A production information system requires sustained operational attention beyond its initial deployment: scheduled maintenance, performance monitoring, cost controls, disaster recovery procedures, and a strategic roadmap for future enhancement. Each of these areas is documented below.

### Operational Maintenance

Prompt templates that govern AI triage quality are version-controlled files, not compiled code, and can be updated without a full software deployment. A quarterly review cycle is recommended: department staff flag misclassifications, and the IT administrator updates the relevant templates and redeploys the AI service container. This cadence aligns with Liu et al.'s (2025) finding that iterative prompt refinement sustains classification accuracy as new request types emerge. Third-party dependencies across all three services should be reviewed monthly using automated tooling (e.g., Dependabot), with critical security patches applied immediately. Updated dependencies are applied through a container rebuild, requiring no host-level changes.

Google OAuth credentials do not require periodic rotation, but the Google Cloud application should be registered to a shared institutional service account rather than an individual staff member's account, to prevent access loss from personnel changes. MongoDB Atlas automated daily backups with point-in-time recovery are included in the M10 cluster tier; no additional backup tooling is required. The IT administrator should verify monthly that recent backups are accessible through the Atlas console.

### Monitoring and Cost Controls

All three services should be monitored by a lightweight uptime check (UptimeRobot free tier or equivalent) targeting the API gateway health endpoint, which confirms both backend and database availability with a single check. LLM API spend should be reviewed monthly against the Chapter 3 projections — median-case annual cost is $31 at the cost-optimized tier, worst case $780 — with a threshold alert at 20% of the projected annual figure to catch volume anomalies early. The audit log and status history collections already capture the data needed for core service desk metrics (ticket volume by department, median resolution time, self-service deflection rate); these can be queried directly or surfaced through the analytics dashboard described in the future roadmap below.

### Disaster Recovery

Two recovery objectives define the system's disaster recovery posture. The **Recovery Time Objective (RTO)** — the maximum acceptable time from failure detection to service restoration — is set at four hours. The **Recovery Point Objective (RPO)** — the maximum acceptable data loss measured in time — is set at 24 hours, corresponding to the daily backup cycle. These targets are consistent with established business continuity management frameworks, in which RTO and RPO are identified as the key parameters used to prioritize critical processes and determine the sequence of recovery for applications and infrastructure following a disruptive incident (Bajgorić et al., 2020).

Table 11 maps each system component to its failure scenario and the procedure that achieves the RTO and RPO targets.

**Table 11**

*Disaster Recovery Procedures by Component*

| Component | Failure Scenario | Recovery Procedure | RTO Impact | RPO Impact |
|---|---|---|:---:|:---:|
| MongoDB database | Data corruption or accidental deletion | Atlas point-in-time restore to most recent daily snapshot | < 2 hours | ≤ 24 hours |
| AI service | LLM provider outage or container crash | Stub fallback responses activate automatically; no manual intervention required for basic ticket functionality | Immediate (automatic) | Not applicable |
| Backend API gateway | Container crash | `docker compose up -d backend` restarts the service; active sessions are preserved in the database | < 15 minutes | Not applicable |
| Frontend | Container crash | `docker compose up -d frontend` restarts the service; no state is held in the frontend container | < 15 minutes | Not applicable |
| Session loss (full restart) | All services down and restarted | Users re-authenticate through Google OAuth; sessions are restored after a single login | < 1 minute per user | Not applicable |

*Note.* AI service fallback behavior ensures ticket management remains functional during LLM provider outages; triage accuracy reverts to static defaults until the service is restored.

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

---

# Final Conclusion

## AI-Powered Student Services Portal: A Comprehensive Project Plan for Westcliff University

---

This project plan has advanced through five phases of analysis, design, and implementation, each building on the findings of the preceding chapter. The arc from problem identification in Chapter 1 to operational maintenance in Chapter 5 constitutes a complete, evidence-grounded case for an institutional technology investment — not a proposal for future exploration, but a documented recommendation for a system already built and ready to deploy.

**Chapter 1** established the institutional context: a student body of 6,524 FTE, a support structure fragmented across ten departmental silos, and a self-directed navigation model that places the full burden of institutional routing on the student. The research evidence confirmed that this model generates misrouted requests, delays initial responses, and produces no data for institutional reporting — at a scale that carries measurable consequences for student retention and staff capacity.

**Chapter 2** translated the problem into a defensible business decision. The weighted decision matrix — evaluated across total cost of ownership, AI-native triage capability, FERPA compliance, institutional fit, and time to deploy — returned a score of 5.00 for the custom-built solution against 2.15 for ServiceNow and Salesforce and 1.25 for Workday. The three-year financial projection documented a positive NPV by Year 3, staff triage savings of $38,500 annually beginning in Year 2, and a cumulative institutional advantage exceeding $513,000 relative to the most economical enterprise alternative. Residual risks were documented without mitigation rhetoric: LLM hallucination requiring human review, cyberattack vectors that architecture cannot eliminate, and the environmental cost of inference at production scale.

**Chapter 3** converted the recommendation into a concrete technical specification. The three-service architecture — web application, API gateway, and stateless AI service — enforces FERPA compliance as a structural property, not a policy layer: the AI service has no credentials, no database connection, and no access to student records. The six-entity data model captures not only tickets and messages but an immutable status history and audit log designed for institutional accountability. The STRIDE threat analysis identified six attack categories and documented specific mitigations for each. The project budget arrived at $27,159 for Year 1 and $5,059 annually recurring — with LLM API costs representing less than 2% of total recurring expenditure even in the worst-case scenario.

**Chapter 4** documented the implementation as executed: six Agile sprints across eleven weeks, each gated on the successful completion of preceding work, followed by a planned production deployment phase. The testing strategy validated authentication enforcement, RBAC behavior, ticket lifecycle transitions, and AI proxy connectivity against a real database instance. The training plan identified two staff audiences — daily users and IT administrators — and defined the competencies and delivery formats required for each. The phased rollout approach — single-department pilot before institutional expansion — mitigates the risk of a full simultaneous cutover.

**Chapter 5** extended the plan beyond go-live into the operational lifecycle: quarterly prompt template reviews, monthly dependency audits, LLM spend monitoring against projected thresholds, disaster recovery procedures with defined RTO and RPO targets, and a three-item future roadmap prioritized by institutional impact. The roadmap items — SLA auto-escalation, an analytics dashboard, and SIS/LMS integration — are not speculative additions; they are direct extensions of the data and architecture already in place.

The evidence presented across five phases converges on a single, consistent conclusion: the current student services intake model at Westcliff University represents a quantifiable institutional liability, and the proposed AI-Powered Student Services Portal constitutes a technically sound, financially defensible, and compliance-aligned response to that liability. The research base draws from production-validated systems operating at comparable scale, the financial projections are grounded in published benchmarking data and verifiable cost structures, and the compliance architecture has been designed to satisfy current FERPA obligations without introducing the sub-processor chain risk associated with enterprise platform alternatives.

The proposed system has progressed beyond the design and planning stages documented in this report — it has been implemented, tested, and validated across six development sprints. What remains is institutional authorization to proceed to production deployment. It is therefore recommended that university leadership approve the transition to a structured pilot phase, beginning with one high-volume service department, as the final and necessary step toward full institutional adoption. The body of evidence assembled in this project plan is sufficient to support that decision.

---

---

# References

Al-Hawari, F., & Barham, H. (2021). A machine learning based help desk system for IT service management. *Journal of King Saud University – Computer and Information Sciences*, *33*(6), 702–718. https://doi.org/10.1016/j.jksuci.2019.04.001

Alami, A., & Krancher, O. (2022). How Scrum adds value to achieving software quality? *Empirical Software Engineering*, *27*(7), Article 165. https://doi.org/10.1007/s10664-022-10208-4

Amoako, G. K., Ampong, G. O., Gabrah, A. Y. B., de Heer, F., & Antwi-Adjei, A. (2023). Service quality affecting student satisfaction in higher education institutions in Ghana. *Cogent Education*, *10*(2), Article 2238468. https://doi.org/10.1080/2331186X.2023.2238468

Bajgorić, N., Turulja, L., Ibrahimović, S., & Alagić, A. (2020). *Enhancing business continuity and IT capability: System administration and server operating platforms*. Auerbach Publications. https://doi.org/10.1201/9781003106098

Bureau of Labor Statistics. (2024a, March). *Occupational employment and wages, May 2023: 15-1252 Software developers*. U.S. Department of Labor. https://www.bls.gov/oes/current/oes151252.htm

Bureau of Labor Statistics. (2024b). *Customer service representatives: Occupational outlook handbook*. U.S. Department of Labor. https://www.bls.gov/ooh/office-and-administrative-support/customer-service-representatives.htm

Collier-Tenison, S., & Polk-Hampton, M. (2024). Student support and retention: College-specific integration of social work case management. *Metropolitan Universities*. https://doi.org/10.18060/27713

Czechowski, N., Johnston, M., Kelty, E., & Zuñiga, F. (2024, October). 2025 EDUCAUSE Top 10 #3: Smoothing the student journey. *EDUCAUSE Review*. https://er.educause.edu/articles/2024/10/2025-educause-top-10-3-smoothing-the-student-journey

Díaz-Garcia, V., Montero-Navarro, A., Rodríguez-Sánchez, J.-L., & Gallego-Losada, R. (2023). Managing digital transformation: A case study in a higher education institution. *Electronics*, *12*(11), Article 2522. https://doi.org/10.3390/electronics12112522

DigitalOcean. (2025). *Droplet pricing*. https://www.digitalocean.com/pricing/droplets

EDUCAUSE. (2016). *Core Data Service almanac: All U.S. institutions with classifications AA, BA, MA, or DR* [Benchmarking report]. https://er.educause.edu/~/media/files/library/2016/2/cda1501.pdf?la=en

EDUCAUSE. (2022). *2022 EDUCAUSE horizon report: Information security edition* [Benchmarking and trend report]. https://www.educause.edu/horizon-report

Gaftandzhieva, S., Hussain, S., Hilčenko, S., Doneva, R., & Boykova, K. (2023). Data-driven decision making in higher education institutions: State-of-play. *International Journal of Advanced Computer Science and Applications*, *14*(6), 397–407. https://doi.org/10.14569/IJACSA.2023.0140642

Gibson, J. (2022). Bridging the divide: Collaborative practice between faculty and student services staff. *International Journal for Leadership in Learning*, *22*(2), 287–318. https://doi.org/10.29173/ijll27

Google. (2025). *Gemini API pricing*. Google for Developers. https://ai.google.dev/pricing

Kithulwatta, W. M. C. J. T., Jayasena, K. P. N., Kumara, B. T. G. S., & Rathnayaka, R. M. K. T. (2022). Integration with Docker container technologies for distributed and microservices applications: A state-of-the-art review. *International Journal of Systems and Service-Oriented Engineering*, *12*(1), 1–22. https://doi.org/10.4018/IJSSOE.297136

Komljenovic, J., Sellar, S., & Birch, K. (2024). Turning universities into data-driven organisations: Seven dimensions of change. *Higher Education*. https://doi.org/10.1007/s10734-024-01277-z

Liu, F., He, X., Zhang, T., Chen, J., Li, Y., Yi, L., Zhang, H., Wu, G., & Shi, R. (2025). TickIt: Leveraging large language models for automated ticket escalation. *arXiv preprint arXiv:2504.08475*. https://arxiv.org/abs/2504.08475 (To appear in *Proceedings of the 33rd ACM International Conference on the Foundations of Software Engineering*. https://doi.org/10.1145/3696630.3728558)

MongoDB. (2025). *MongoDB Atlas pricing*. https://www.mongodb.com/pricing

OpenAI. (2025). *API pricing*. https://openai.com/api/pricing/

OWASP Foundation. (2021). *OWASP application security verification standard 4.0.3*. https://owasp.org/www-project-application-security-verification-standard/

Page, L. C., & Gehlbach, H. (2017). How an artificially intelligent virtual assistant helps students navigate the road to college. *AERA Open*, *3*(4), 1–12. https://doi.org/10.1177/2332858417749220

Patterson, D., Gonzalez, J., Le, Q., Liang, C., Munguia, L., Rothchild, D., So, D., Texier, M., & Dean, J. (2022). Carbon emissions and large neural network training. *arXiv*. https://arxiv.org/abs/2104.10350

Razma, A., & Jurkus, R. (2026). AI-based classification of IT support requests in enterprise service management systems. *Systems*, *14*(2), Article 223. https://doi.org/10.3390/systems14020223

Rumburg, J. (2018, March 20). Metric of the month: Tickets per user per month. *SupportWorld*. https://www.thinkhdi.com/library/supportworld/2018/metric-of-month-tickets-per-user-per-month

Salesforce. (2025). *Service Cloud pricing*. https://www.salesforce.com/products/service-cloud/pricing/

ServiceNow. (2025). *Pricing*. https://www.servicenow.com/lpgp/pricing.html

Shostack, A. (2014). *Threat modeling: Designing for security*. Wiley.

Strubell, E., Ganesh, A., & McCallum, A. (2019). Energy and policy considerations for deep learning in NLP. *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics*, 3645–3650. https://doi.org/10.18653/v1/P19-1355

Teeroovengadum, V., Nunkoo, R., Gronroos, C., Kamalanabhan, T. J., & Seebaluck, V. (2019). Higher education service quality, student satisfaction and loyalty: Validating the HESQUAL scale and testing an improved structural model. *Quality Assurance in Education*, *27*(3), 506–529. https://doi.org/10.1108/QAE-01-2019-0003

U.S. Department of Education. (2021). *Family Educational Rights and Privacy Act (FERPA)*. https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html

Verizon. (2024). *2024 Data breach investigations report*. https://www.verizon.com/business/resources/reports/2024-dbir-data-breach-investigations-report.pdf

WASC Senior College and University Commission. (2026). *Statement of accreditation status: Westcliff University* [Accreditation status report]. https://www.wscuc.org/institutions/westcliff-university/?print=pdf

Westcliff University. (n.d.). *Service catalog* [Student support portal]. https://services.westcliff.edu/TDClient/48/Portal/Requests/ServiceCatalog

Windiatmoko, Y., Rahmadi, R., & Hidayatullah, A. F. (2021). Developing Facebook chatbot based on deep learning using RASA framework for university enquiries. *IOP Conference Series: Materials Science and Engineering*, *1077*(1), Article 012060. https://doi.org/10.1088/1757-899X/1077/1/012060

