# PA4-05: Budget Section

**Parent:** PA4 — Phase 3: Project Design
**Target length:** 0.5–1 page
**Priority:** Medium — required by syllabus ("required budget information for business planning")

---

## What to Write

**Section 3.5 — Project Budget**

### Content

1. **One-Time Development Costs:**

   | Category | Item | Estimated Cost |
   |----------|------|---------------|
   | Labor | Developer (capstone project scope — ~400 hrs) | $34,000* |
   | Infrastructure | Docker/cloud environment setup | $0 (Docker Compose, local dev) |
   | Auth | Google OAuth configuration | $0 (free tier) |
   | **Total Year 1 Dev** | | **~$34,000** |

   *\*Based on $85/hr junior-to-mid dev rate — adjust if professor wants a different framing*

2. **Recurring Annual Costs:**

   | Category | Item | Annual Cost |
   |----------|------|-------------|
   | LLM API | OpenAI GPT-4o (estimated ~2,000 tickets/semester × ~4 API calls/ticket × ~$0.01/call) | ~$160/yr |
   | LLM API | Gemini fallback (same estimate) | ~$80/yr |
   | Hosting | Cloud VM (2 vCPU, 4GB RAM) or equivalent | ~$600–1,200/yr |
   | Database | MongoDB Atlas M10 or self-hosted | ~$0–700/yr |
   | Maintenance | Staff developer time (~5 hrs/month) | ~$5,100/yr |
   | **Total Annual** | | **~$6,000–7,200/yr** |

3. **3-Year TCO comparison** (tie back to PA3 decision matrix):

   | | Custom Build | ServiceNow | Salesforce |
   |---|---|---|---|
   | Year 1 | ~$40,000 | ~$150,000+ | ~$120,000+ |
   | Year 2 | ~$7,000 | ~$80,000 | ~$70,000 |
   | Year 3 | ~$7,000 | ~$80,000 | ~$70,000 |
   | **3-Year Total** | **~$54,000** | **~$310,000+** | **~$260,000+** |

4. **Key assumptions to state:**
   - Ticket volume: ~2,000 tickets/semester (~4,000/year) based on Westcliff enrollment
   - LLM pricing as of early 2026 — subject to continued cost declines
   - Self-hosted MongoDB vs Atlas depends on IT staff capacity
   - No licensing fees — all components are open-source or free-tier

### Research Tasks
- [ ] Verify current OpenAI GPT-4o and Gemini pricing (tokens per triage call × volume)
- [ ] Look up MongoDB Atlas M10 pricing
- [ ] Check basic cloud VM pricing (AWS/GCP/DigitalOcean)

### Artifacts Needed
- [ ] Cost tables labeled as **Table X** per APA
