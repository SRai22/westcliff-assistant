# PA1 Draft — Phase 1: Background, Business Justification, and Project Introduction
## AI-Powered Student Services Portal: A Business Case for Westcliff University

---

---

> **APA 7 Cover Page (format in Word/Docs)**
>
> AI-Powered Student Services Portal: A Business Case for Westcliff University
>
> [Your Full Name]
> Westcliff University
> CAP 690: Masters Applied Capstone
> [Professor Name]
> [Date]

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

The impact on students is measurable. Collier-Tenison (2024) documented that in a support system serving approximately 3,000 students, students who encountered navigation barriers were significantly less likely to follow through on help-seeking, not because the support did not exist, but because accessibility and routing clarity were insufficient. The study reported that 779 referrals were processed over a two-year evaluation period — and that responsiveness targets of 24-hour initial contact were used as a standard precisely because delays in initial response were known to reduce student engagement with the support process. At Westcliff's enrolled scale, comparable navigation and responsiveness gaps represent a significant unaddressed operational risk.

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

## Conclusion and Recommendation

The current student services intake model at Westcliff University is a structural liability. It places navigation burden on students, produces misrouted and delayed requests, generates no institutional data, and scales poorly with enrollment growth. The research evidence confirms that these are not minor inconveniences — they have measurable effects on student satisfaction, institutional loyalty, and the effective use of staff capacity.

The proposed AI-Powered Student Services Portal addresses each of these issues directly, through a system already designed, prototyped, and demonstrated to work in Westcliff's specific institutional context. It is the recommendation of this proposal that university leadership approve advancement of this project into the formal design and implementation planning phases, with the objective of piloting the system with one or more student services departments within the upcoming academic cycle.

---

## References

Al-Hawari, F., & Barham, H. (2021). A machine learning based help desk system for IT service management. *Journal of King Saud University – Computer and Information Sciences*, *33*(6), 702–718. https://doi.org/10.1016/j.jksuci.2019.04.001

Amoako, G. K., Ampong, G. O., Gabrah, A. Y. B., de Heer, F., & Antwi-Adjei, A. (2023). Service quality affecting student satisfaction in higher education institutions in Ghana. *Cogent Education*, *10*(2), Article 2238468. https://doi.org/10.1080/2331186X.2023.2238468

Collier-Tenison, S., & Polk-Hampton, M. (2024). Student support and retention: College-specific integration of social work case management. *Metropolitan Universities*. https://doi.org/10.18060/27713

EDUCAUSE. (2016). *Core Data Service almanac: All U.S. institutions with classifications AA, BA, MA, or DR* [Benchmarking report]. https://er.educause.edu/~/media/files/library/2016/2/cda1501.pdf?la=en

Gaftandzhieva, S., Hussain, S., Hilcenko, S., Doneva, R., & Boykova, K. (2023). Data-driven decision making in higher education institutions: State-of-play. *International Journal of Advanced Computer Science and Applications*, *14*(6). https://doi.org/10.14569/IJACSA.2023.0140642

Gibson, J. (2022). Bridging the divide: Collaborative practice between faculty and student services staff. *International Journal for Leadership in Learning*, *22*(2), 287–318. https://doi.org/10.29173/ijll27

National Center for Education Statistics. (2022). *IPEDS data feedback report: Westcliff University (UnitID 490133)* [Institutional data report]. U.S. Department of Education. https://nces.ed.gov/ipeds/dfr/2022/ReportHTML.aspx?unitId=490133

Page, L. C., & Gehlbach, H. (2017). How an artificially intelligent virtual assistant helps students navigate the road to college. *AERA Open*, *3*(4), 1–12. https://doi.org/10.1177/2332858417749220

Razma, A., & Jurkus, R. (2026). AI-based classification of IT support requests in enterprise service management systems. *Systems*, *14*(2), 223. https://doi.org/10.3390/systems14020223

Westcliff University. (n.d.). *Service catalog* [Student support portal]. https://services.westcliff.edu/TDClient/48/Portal/Requests/ServiceCatalog

WASC Senior College and University Commission. (2026). *Statement of accreditation status: Westcliff University* [Accreditation status report]. https://www.wscuc.org/institutions/westcliff-university/?print=pdf

Komljenovic, J., Sellar, S., & Birch, K. (2024). Turning universities into data-driven organisations: Seven dimensions of change. *Higher Education*. https://doi.org/10.1007/s10734-024-01277-z

Woelert, P. (2023). Administrative burden in higher education institutions: A conceptualisation and a research agenda. *Journal of Higher Education Policy and Management*. https://doi.org/10.1080/1360080X.2023.2190967

Wong, W. H., & Chapman, E. (2022). Student satisfaction and interaction in higher education. Higher Education, 85(5), 957–978. https://www.researchgate.net/publication/361021976_Student_satisfaction_and_interaction_in_higher_education
