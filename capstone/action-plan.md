# CAP 690 — Week-by-Week Action Plan

Mapped to syllabus phases + professor feedback received 2026-03-14.

---

## Week 2 — PA1: Background, Business Justification & Project Introduction

**Due: Sunday 11:59 PM PT | 5–7 pages | 3+ citations**

### Sections to write
1. **Westcliff University background** — size, student population, departments served
2. **The problem** — fragmented student intake, no unified routing, 10 departments with no central system
3. **Quantify the problem** — use research benchmarks:
   - Average higher-ed help desk ticket volume per semester
   - Cost of misrouted/unresolved tickets (staff time, student satisfaction)
   - Industry data on resolution time without triage automation
4. **Proposed solution** — introduce the system at a high level, no technical details yet
5. **Business justification** — efficiency gains, student satisfaction, operational cost savings

### Parallel action
- Email Westcliff student services or IT to ask about current ticket/inquiry volume
- Reply to professor and take him up on his offer to connect with university stakeholders — do this now while the conversation is warm

---

## Week 3 — PA2: Annotated Bibliography

**Due: Sunday 11:59 PM PT | Cover page required | 3–4 sources | 150+ words per annotation**

### What this assignment is (not just a references page)
Each source needs three explicit parts:
1. **Summary** — What did the source investigate? What did they find?
2. **Evaluation** — Why is it credible? Who wrote it? What are the limitations?
3. **Application** — How does it inform a specific decision in this project?

### Source quality hierarchy (strictly follow)
- **Best:** Peer-reviewed academic journals, industry reports (Gartner, Forrester)
- **Strong:** Professional magazines (CIO, TechRepublic), expert whitepapers
- **Acceptable (sparingly):** Expert blogs, verified case studies
- **Avoid:** Vendor marketing, Wikipedia, anonymous forums, ChatGPT output

### Approved research sites
- `www.frontiersin.org` · `www.researchgate.net` · `arxiv.org` · `www.academia.edu`
- IEEE Explore (open access only) · Nature · Springer (open access only)

### Confirmed sources (updated for PA2 — technology evaluation focus)

**Source 1 — Pre-LLM university chatbot baseline**
> Windiatmoko, Y., Rahmadi, R., & Hidayatullah, A. F. (2021). Developing Facebook chatbot based on deep learning using RASA framework for university enquiries. *IOP Conference Series: Materials Science and Engineering*, *1077*(1), 012060. https://doi.org/10.1088/1757-899X/1077/1/012060

- Open access (CC 3.0). Conference proceedings (ICITDA 2020).
- Covers: RASA + LSTM chatbot for university student enquiries; F1 = 0.98 on 14 intent classes; never deployed in production
- Apply to: Establishes the ceiling of pre-LLM approaches — fixed intent taxonomy, brittle to open-ended queries — directly justifying the LLM-native design choice
- ✅ Annotation fully written — see Chatbot-RASA.md

**Source 2 — LLM ticket routing at production scale**
> Liu, F., He, X., Zhang, T., Chen, J., Li, Y., Yi, L., Zhang, H., Wu, G., & Shi, R. (2025). TickIt: Leveraging large language models for automated ticket escalation. In *Proceedings of the 33rd ACM International Conference on the Foundations of Software Engineering (FSE '25)*. https://doi.org/10.1145/3696630.3728558

- Open access preprint: https://arxiv.org/abs/2504.08475. Top-tier venue (ACM FSE).
- Covers: LLM-based dynamic ticket routing; 11-team routing parallels 10 Westcliff departments; F1 = 0.862; 39% MTTR reduction; 20,000+ tickets processed
- Apply to: Justifies the LLM over SLM/classifier design decision; production evidence for the triage engine architecture
- ✅ Annotation fully written — see TickIt.md

**Source 3 — Enterprise ITSM platforms in higher education**
> Czechowski, N., Johnston, M., Kelty, E., & Zuñiga, F. (2024, October). 2025 EDUCAUSE Top 10 #3: Smoothing the student journey. *EDUCAUSE Review*. https://er.educause.edu/articles/2024/10/2025-educause-top-10-3-smoothing-the-student-journey

- Free access. EDUCAUSE Review (strong industry tier — not peer-reviewed, flag in annotation).
- Covers: ServiceNow, Salesforce Student Success, Workday Student — proactive vs reactive student services model; enterprise platform trade-offs in a university context
- Apply to: Names the alternative platforms this project competes with; grounds the make-vs-buy decision in real institutional context
- ❌ Annotation not yet written

**Source 4 — ITSM triage automation at enterprise scale**
> Razma, G., & Jurkus, A. (2026). Automating IT service management: NLP-based ticket classification in multilingual enterprise environments. *Systems*, *14*(2), Article 223. https://doi.org/10.3390/systems14020223

- Peer-reviewed journal. Full text verified — both key figures confirmed accurate.
- Covers: Manual triage identified as "most time-consuming and error-prone tasks" in 87,000-ticket enterprise ITSM dataset; NLP automation significantly improves classification accuracy
- Apply to: Empirical evidence that automated NLP triage outperforms manual routing; directly supports the triage engine design decision
- ❌ Annotation not yet written

### APA 7 format reminders
- Author: Last, F. M. (Year).
- Title: Sentence case (only first word + proper nouns capitalised)
- Journal: *Italicised*
- DOI preferred: `https://doi.org/10.xxxx`
- No separate References page — annotations are embedded in the paper

### Common mistakes to avoid
- Annotations under 150 words
- Generic application statement ("This is relevant to my project") — be specific
- Missing evaluation section (do not just summarise the abstract)
- Mixing APA 6 and APA 7 styles
- Using vendor marketing or Wikipedia as sources

### Feeds into
These 3–4 sources plug directly into PA3 (comparison table + recommendation) and the CLA final paper.

### Additional sources (not annotated in PA2 — available for PA3, PA4, CLA)

**Woelert (2023) — Administrative burden in HEIs**
> Woelert, P. (2023). Administrative burden in higher education: Between the logics of bureaucracy and profession. *Journal of Higher Education Policy and Management*, *45*(4), 409–422. https://doi.org/10.1080/1360080X.2023.2190967

- Peer-reviewed journal. Full text accessible.
- Covers: HEIs as hybrid organisations — managerial control vs professional autonomy creates systemic administrative burden
- Best for: CLA background / PA5 — theoretical grounding for why the problem is structural
- ⚠️ PA1 misquoted this source. If reused, cite the actual argument: hybrid org structure creates burden, not "coordination complexity across domains"

**Komljenovic et al. (2025) — Data fragmentation in universities**
> Komljenovic, J., Sellar, S., & Birch, K. (2025). Data and the new university. *Higher Education*, *89*(5), 1369–1386. https://doi.org/10.1007/s10734-024-01277-z

- Peer-reviewed, high-impact journal. Paywalled — confirm full PDF access before using.
- Covers: Fragmented, siloed administrative data prevents actionable business intelligence in universities
- Best for: CLA / PA5 — justifies the unified data layer and audit trail

**Page & Gehlbach (2017) — AI automation proof of concept in HE**
> Page, L. C., & Gehlbach, H. (2017). How an artificially intelligent virtual assistant helps students navigate the road to college. *AERA Open*, *3*(4), 1–12. https://doi.org/10.1177/2332858417749220

- Peer-reviewed, open access. Georgia State University field experiment.
- Covers: AI assistant reduced summer melt by 3.3pp; cost $7–$15/student vs $100–$200 for human outreach
- Best for: CLA business justification — ROI framing for AI in student support
- ❌ Do NOT use the "21% reduction" figure — it is derived math, not stated in the paper

**Napitupulu et al. (2018) — Student satisfaction with university services**
> Napitupulu, D., Rahim, R., Abdullah, D., Setiawan, M. I., Abdillah, L. A., Ahmar, A. S., Simarmata, J., Hidayat, R., Nurdiyanto, H., & Pranolo, A. (2018). Analysis of student satisfaction toward quality of service facility. *Journal of Physics: Conference Series*, *954*(1), 012019. https://doi.org/10.1088/1742-6596/954/1/012019

- Open access (CC 3.0). Full text: https://iopscience.iop.org/article/10.1088/1742-6596/954/1/012019
- Covers: Gap analysis of student expectations vs perceptions; IT/digital services ranked lowest of all facility types; 52.5% of satisfaction explained by service quality
- ⚠️ Pre-COVID (2018) — use carefully; student digital expectations have shifted significantly post-pandemic
- Best for: CLA background; supplementary evidence that student dissatisfaction with digital services is a documented pattern

---

## Week 4 — PA3: Research & Recommendation

**5–7 pages | Decision criteria + recommendation**

### Sections to write
1. Summary of annotated bibliography research
2. **Comparison table** — 4 systems × 6–8 criteria:
   - Cost, AI capability, FERPA compliance, customizability, Westcliff fit, time to deploy
3. Decision criteria — why those criteria matter for a university context
4. Recommendation — custom build wins on Westcliff branding, AI-native design, data control, and cost
5. Introduction to governance decisions (auth, privacy, RBAC) — full detail in PA4

---

## Week 5 — PA4: Project Design

**7–10 pages | Full system design + governance**

### Sections to write
1. **Architecture** — 3-service diagram (React SPA → Express API → FastAPI AI)
2. **Data models** — User, Ticket, Message, StatusHistory, AuditLog
3. **Governance** *(professor's explicit ask)*:
   - Authentication: Google OAuth restricted to `@westcliff.edu`
   - Data privacy: what student data is stored, who can access it, FERPA implications
   - RBAC: student vs. staff permissions enforced in middleware, not just UI
   - Audit logging: every status change and AI output is traceable
4. **Budget** — LLM API costs (OpenAI/Gemini), cloud hosting estimate, dev/maintenance hours
5. **UI mock-ups** — screenshots of the working system serve as mock-ups

---

## Week 6 — PA5: Implementation + Maintenance

**4–5 pages implementation | 2–3 pages maintenance**

### Implementation sections
- Sprint breakdown by phase (Backend → AI Service → Frontend → Polish)
- Task dependencies and timeline
- Docker-first deployment approach
- Staff training plan for the admin dashboard

### Maintenance sections
- LLM prompt tuning cadence
- MongoDB backup strategy
- Google OAuth key rotation
- Future roadmap: attachments, mobile app, SLA automation, analytics dashboard

---

## Week 7 — CLA: Full Project Paper

Compile all 5 phases into one cohesive document.

**Required components:**
- Cover page
- Executive summary (write this last)
- Table of contents (+ list of tables and figures)
- Chapters 1–5 (one per phase)
- Final conclusion
- References (APA 7, hanging indents)

**Expected length:** ~26–38 pages

---

## Week 8 — Final Presentation

**8–10 minutes | Live demo + slides**

- Adapt `docs/presentation-professor-pitch.md` into PowerPoint slides
- Visual anchors: architecture diagram + comparison chart from PA3
- Demo the live system during the presentation
- Frame as a real university deployment proposal, not just a class project

---

## Key Reminders

- All written work: APA 7 format, 1" margins, double spacing, cover page, page numbers
- Required page lengths do **not** include cover or references pages
- All submissions due **Sunday at 11:59 PM Pacific Time**
- Every phase can be appended to the previous one — build one cumulative document
