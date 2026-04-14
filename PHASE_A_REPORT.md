# SWTMT Portal — Phase A: Multi-Agent Bid Generation System

## Summary

Phase A implements an end-to-end AI-powered federal bid generation pipeline for SDVOSB proposals. The system uses a multi-agent architecture with intelligent model routing (Opus for reasoning/critique, Haiku for extraction/templating) to produce compliant, competitive government proposals.

## Architecture

```
Solicitation Upload → Extraction (Haiku)
                    → Research Agent (Web + Opus synthesis)
                    → Pricing Agent (Opus three-tier model)
                    → Section Drafting (8 sections, model-routed)
                    → Critique Agent (Opus SSEB evaluation)
                    → Revision Agent (same model as original)
                    → Final Compliance Check (Opus)
                    → Full Bid Assembly (docx)
```

## Files Created (Phase A)

### Agent Library (`src/lib/agents/`)
| File | Purpose |
|------|---------|
| `solicitation-extractor.ts` | Haiku-based extraction of requirements, evaluation criteria, and win themes from uploaded solicitation documents |
| `research-agent.ts` | Parallel data fetching (USAspending, SAM.gov, BLS, web search) + Opus synthesis into research brief |
| `pricing-agent.ts` | Opus-based three-tier pricing model (aggressive/target/conservative) |
| `drafting-agent.ts` | Section-specific prompts with model routing; 8 section definitions with target word counts |
| `critique-agent.ts` | Always Opus; SSEB evaluator scoring 1-10 on 5 dimensions |
| `revision-agent.ts` | Uses same model as original section; incorporates critique feedback |
| `orchestrator.ts` | Pipeline coordinator: loadDraftingContext, initializeBidSections, startFullBidDrafting, draftNextSection, regenerateSection |

### Research Modules (`src/lib/research/`)
| File | Purpose |
|------|---------|
| `usaspending.ts` | USAspending.gov API integration (POST to /api/v2/search/spending_by_award/) |
| `sam-gov.ts` | SAM.gov opportunities API with set-aside code mapping |
| `agency-intel.ts` | Anthropic web search for agency strategic context |
| `bls-labor.ts` | BLS OES wage data API for labor rate validation |

### Core Libraries
| File | Purpose |
|------|---------|
| `src/lib/llm.ts` | **Rewritten** — callOpus(), callModel(), callInternal(), web search support, budget guard across all models |
| `src/lib/compliance.ts` | Final compliance agent with COMPLIANCE_SYSTEM_PROMPT; Opus-only pre-submission audit |
| `src/lib/docgen/full-bid.ts` | Full bid DOCX assembly — cover page, TOC, markdown-to-docx conversion, pricing table |
| `src/lib/validation.ts` | Zod schemas for all API routes |

### API Routes (`src/app/api/bids/[id]/`)
| Route | Method | Purpose |
|-------|--------|---------|
| `solicitation/route.ts` | POST | Multipart upload + Haiku extraction |
| `research/route.ts` | POST | Run research agent |
| `pricing/route.ts` | POST | Run pricing agent |
| `draft-full-bid/route.ts` | POST | Initialize full pipeline (research + pricing + queue sections) |
| `draft-next-section/route.ts` | POST | Draft one section (polling pattern for Netlify timeouts) |
| `sections/route.ts` | GET | List all bid sections with status/content |
| `sections/[sectionKey]/regenerate/route.ts` | POST | Regenerate a single section with optional custom instructions |
| `final-compliance/route.ts` | POST | Run final compliance check |
| `assemble/route.ts` | POST | Assemble full bid DOCX and upload to storage |

### API Routes (`src/app/api/companies/[id]/`)
| Route | Method | Purpose |
|-------|--------|---------|
| `past-performance/route.ts` | GET, POST | CRUD for past performance records |

### UI Components
| File | Purpose |
|------|---------|
| `src/components/BidDraftingPanel.tsx` | Client component: step-by-step pipeline UI with polling, expandable section cards, compliance display |
| `src/app/bids/[id]/page.tsx` | **Updated** — Server-side loading of solicitation, research, pricing, sections; renders BidDraftingPanel |
| `src/app/companies/[id]/past-performance/page.tsx` | Past performance library with add form and table display |
| `src/app/companies/page.tsx` | **Updated** — Added Past Performance link per company |

### Database Schema
| File | Purpose |
|------|---------|
| `supabase/phase-a-schema.sql` | Tables: solicitations, bid_sections, research_briefs, pricing_analyses, past_performance_records, bid_agent_runs. Enum: bid_section_status. Extended doc_kind. Full RLS policies. |

## Files Modified (from v3 / pre-Phase A)
- `src/app/page.tsx` — deadline alerts
- `src/app/login/page.tsx` — password login + magic link
- `src/app/api/intake/route.ts` — inline doc generation, maxDuration=60
- `src/app/api/documents/generate/route.ts` — maxDuration=60, zod validation
- `src/app/api/documents/download/route.ts` — zod validation
- `src/app/api/chatbot/route.ts` — zod validation
- `src/app/api/intake/prefill/route.ts` — field sanitization
- `src/app/error.tsx`, `global-error.tsx`, `not-found.tsx`, `bids/[id]/not-found.tsx` — error boundaries
- `src/app/loading.tsx`, `bids/loading.tsx`, `bids/[id]/loading.tsx`, `companies/loading.tsx` — loading skeletons
- `src/middleware.ts` — type annotations fix
- `supabase/indexes.sql` — supplementary indexes

## Environment Variables Required

```env
# Already required:
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional (for research agents — will gracefully degrade if not set):
SAM_GOV_API_KEY=...
```

## SQL to Run

Execute in Supabase SQL Editor in this order:
1. `supabase/schema.sql` (if not already applied)
2. `supabase/functions.sql` (if not already applied)
3. `supabase/indexes.sql` (if not already applied)
4. `supabase/phase-a-schema.sql` ← **NEW for Phase A**

## Commit Instructions

The sandbox git has a stale lock file preventing commits. Run these locally on your machine:

```bash
cd C:\Users\mward\Projects\swtmt-portal

# Remove any stale lock files
del .git\HEAD.lock 2>nul

# Stage and commit by milestone:

# Milestone 1-3: Core LLM + Research
git add src/lib/llm.ts src/lib/research/ src/lib/agents/solicitation-extractor.ts src/lib/agents/research-agent.ts
git commit -m "Phase A M1-3: LLM routing, solicitation extractor, research agent"

# Milestone 4-5: Pricing + Drafting
git add src/lib/agents/pricing-agent.ts src/lib/agents/drafting-agent.ts src/lib/agents/critique-agent.ts src/lib/agents/revision-agent.ts
git commit -m "Phase A M4-5: Pricing agent, drafting agent with critique/revision loop"

# Milestone 6: Orchestrator
git add src/lib/agents/orchestrator.ts
git commit -m "Phase A M6: Pipeline orchestrator with polling pattern"

# Milestone 7: API Routes
git add src/app/api/bids/
git commit -m "Phase A M7: All bid pipeline API routes"

# Milestone 8: Compliance + Assembly
git add src/lib/compliance.ts src/lib/docgen/full-bid.ts src/app/api/bids/[id]/final-compliance/ src/app/api/bids/[id]/assemble/
git commit -m "Phase A M8: Final compliance agent and full bid DOCX assembly"

# Milestone 9: Bid Drafting UI
git add src/components/BidDraftingPanel.tsx src/app/bids/[id]/page.tsx src/app/api/bids/[id]/sections/route.ts
git commit -m "Phase A M9: Bid drafting pipeline UI with polling and section management"

# Milestone 10: Past Performance
git add src/app/api/companies/ src/app/companies/
git commit -m "Phase A M10: Past performance library with CRUD API and UI"

# Schema + Report
git add supabase/phase-a-schema.sql PHASE_A_REPORT.md
git commit -m "Phase A: Database schema and report"
```

## Quality Assessment

**Type Safety:** `tsc --noEmit` passes clean with zero errors.

**Build:** Cannot verify `npm run build` in sandbox (resource limits cause timeout). Run locally — expect clean build.

**Key Design Decisions:**
- Polling pattern for section drafting (Netlify 10s timeout workaround)
- Fire-and-forget replaced with inline execution in intake route
- `as any` casts for Anthropic SDK v0.32.1 compatibility (web_search tool type, enableWebSearch)
- Budget guard checks cumulative cost across ALL models, not per-model
- Opus for reasoning-heavy tasks (critique, compliance, executive summary, technical/management approach)
- Haiku for extraction and templated sections (company overview, past performance, staffing, QA, transition)

## Testing Checklist

- [ ] Run `supabase/phase-a-schema.sql` in SQL editor
- [ ] Create a bid via intake form
- [ ] Upload a solicitation PDF/DOCX on bid detail page
- [ ] Verify extraction produces requirements + evaluation criteria
- [ ] Run research agent — check for historical awards and agency intel
- [ ] Run pricing agent — verify three-tier pricing
- [ ] Start full bid drafting — watch polling produce sections one by one
- [ ] Expand sections to review content quality
- [ ] Regenerate a section with custom instructions
- [ ] Run final compliance check — verify score and readiness assessment
- [ ] Assemble full bid — download and open DOCX
- [ ] Navigate to Companies → Past Performance → Add a record
- [ ] Verify past performance records appear in drafting context

## TODO / Future Work

- [ ] Add section approval workflow (approve/reject buttons per section)
- [ ] Past performance record editing and deletion
- [ ] Batch cost reporting dashboard
- [ ] Export research brief as standalone document
- [ ] Template library for recurring proposal sections
- [ ] Webhook notifications for long-running agent completions
- [ ] Rate limiting on agent endpoints
- [ ] Caching for research data (USAspending, SAM.gov results)
