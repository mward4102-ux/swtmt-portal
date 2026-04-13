# SWTMT Portal — Architecture & Build Plan (v3)

**Version:** 3.0
**Owner:** Michael Ward / SWTMT Strategic Solutions
**Date:** April 13, 2026

---

## 1. Purpose

One production-ready portal that runs the SDVOSB lifecycle end to end: **upload existing docs → auto-prefilled intake → compliant document generation → bid lifecycle tracking → fulfillment → closeout**. Veterans, mentor companies, and SWTMT admins all log in. An in-app chatbot drafts and retrieves documents on command. No Paperclip, no local relay, no Ollama. Three services total.

---

## 2. What changed from v1

The v1 plan had a local Express relay on the Windows bot box proxying to Ollama, Claude Haiku, and a Paperclip "Bid Orchestrator" agent. Every one of those layers was doing work the portal could do directly:

| v1 component | v2 replacement | Why |
|---|---|---|
| Paperclip Bid Orchestrator agent | Next.js API route → Claude Haiku | Drafting and compliance are just system-prompted Claude calls. No agent framework needed. |
| Ollama + phi3.5 classifier | Keyword rules in `src/lib/llm.ts` | 90% of chatbot routing is already covered by keyword rules. Haiku is cheap enough for the rest. |
| Local Express relay | Next.js API routes on Netlify | Nothing left to proxy. Anthropic key lives in Netlify env. |
| Cloudflare Tunnel | Not needed | No local service to expose. |
| PM2 `swtmt-relay` process | Not needed | Bot box stays focused on Kalshi + Solana. |

**Result:** 8 moving parts → 3. Less to break, less to explain to mentors and veterans, less that can go wrong during a bid deadline at 11:47 PM.

---

## 3. Who it serves

| Role | Access |
|---|---|
| **SWTMT Admin** | Everything. Manage companies, users, bids, templates, budgets. |
| **Mentor Company** (Leading Edge, Sears, Novus Linea) | Their own JV protégés. Review, comment, upload past performance. |
| **Veteran / Protégé Operator** | Submit intake, view own bids, generate + download docs, use the chatbot. |

Enforced at the database layer with Postgres row-level security.

---

## 4. Stack — final picks (v2)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind on **Netlify** | One codebase for pages and API routes. Same deploy path as PlastiBioFuel. |
| Auth | **Supabase Auth** | Magic link, role claims in JWT, wired into RLS. |
| Database | **Supabase Postgres** | RLS enforces multi-tenant isolation. Free tier gets us to real scale. |
| File storage | **Supabase Storage** | Uploads, generated docs, all signed URLs. |
| LLM | **Claude Haiku 4.5** via Anthropic SDK, called from Next.js API routes | Cheap, fast, natively reads PDFs + images for prefill. Hard monthly cap in `.env`. |
| Doc generation | `docx` library | Capability statements, SF form drafts. Same library used for LVC's prior capability statement. |
| Doc extraction (prefill) | Claude Haiku with document/image blocks + `mammoth` for DOCX | Claude reads PDFs and images natively. Mammoth converts DOCX to text. No `pdf-parse` needed. |

**Total recurring cost at launch:** ~$5–$15/month (Netlify free, Supabase free, domain optional, Haiku metered under cap).

---

## 5. System diagram

```
┌─────────────────────────────────────────────────────────┐
│  USERS (Admin / Mentor / Veteran)                       │
│  Browser → portal.swtmt.com (Netlify)                   │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────┐
│  NEXT.JS APP (Netlify)                                  │
│                                                         │
│  Pages:                                                 │
│    /          dashboard                                 │
│    /intake    upload + form (prefill powered by Haiku)  │
│    /bids      kanban pipeline                           │
│    /bids/[id] bid detail + docs                         │
│    /companies directory                                 │
│    /login     magic link                                │
│                                                         │
│  API routes:                                            │
│    /api/intake/prefill   — Haiku extracts from upload   │
│    /api/intake           — save intake, create bid      │
│    /api/documents/generate — build docx                 │
│    /api/documents/download — signed URL                 │
│    /api/chatbot          — route to Haiku or DB lookup  │
│                                                         │
│  Server-side calls:                                     │
│    • Supabase (DB, Auth, Storage)                       │
│    • Anthropic API (Claude Haiku 4.5)                   │
└─────────┬───────────────────────────────┬───────────────┘
          │                               │
          ▼                               ▼
  ┌───────────────┐               ┌──────────────────┐
  │ SUPABASE      │               │ ANTHROPIC API    │
  │ Postgres+RLS  │               │ Claude Haiku 4.5 │
  │ Auth          │               │ (capped spend)   │
  │ Storage       │               │                  │
  └───────────────┘               └──────────────────┘
```

No bot box in the diagram at all. That's the point.

---

## 6. Data model

Same tables as before, minus any Paperclip coupling. RLS policies: admin sees all, mentors see their own company + protégés, operators see their own company.

```
companies, users, intakes, bids, documents,
bid_events, chat_sessions, chat_messages,
llm_usage, templates
```

---

## 7. Intake flow with upload + prefill

```
1. Operator opens /intake
2. Drops 1–5 existing documents into the upload zone:
   • Old capability statement (PDF/DOCX)
   • SAM.gov entity printout
   • Prior bid submissions
   • Business license, certificates
   • W-9
3. Frontend posts files to /api/intake/prefill
4. Server:
   a. Uploads raw files to Supabase Storage (audit trail)
   b. For each file:
      - DOCX: mammoth → plain text
      - PDF / image: sent to Haiku as a document/image block
      - TXT: passed through
   c. Single Haiku call with strict JSON-only extraction prompt
   d. Returns merged field map to the frontend
5. Frontend populates every field it can
6. Operator reviews, corrects, fills gaps, submits
7. Submit creates company + bid + kicks off doc generation
```

The extraction prompt forces Haiku to return `null` for fields it can't confidently infer rather than hallucinating. Source file list is always visible under the form so operators can verify.

---

## 8. Document generation flow

```
Intake submit
    ↓
/api/intake inserts rows + calls /api/documents/generate
    ↓
Generator builds .docx from template + Haiku narrative enrichment
    ↓
Uploaded to Supabase Storage, row in documents table, event logged
    ↓
Visible on /bids/[id] with download link
```

Launch kinds: capability statement (full template), SF 1449 cover draft (skeleton). Extension points marked `TODO:` in each generator.

---

## 9. Chatbot design

Slide-out on every page. Routing is keyword-first, Haiku-only:

```
classify(query) via keyword rules →
  • doc_lookup     → Supabase query, no LLM call at all
  • doc_generate   → /api/documents/generate
  • compliance_q   → Haiku with compliance system prompt
  • general_chat   → Haiku with light system prompt
```

Hard budget: `LLM_MONTHLY_CAP_USD` (default $25). At 80% a warning banner appears. At 100% Haiku is blocked, chatbot falls back to DB-only mode. Usage tracked in `llm_usage` via atomic upsert RPC.

---

## 10. Deployment plan

**Phase 0 — Prereqs (one-time):**
1. Supabase account → new project `swtmt-portal`. Save URL, anon key, service role key.
2. Anthropic API key with Haiku access.
3. GitHub account.

**Phase 1 — Portal:**
1. Push `swtmt-portal/` to a new GitHub repo.
2. Run `supabase/schema.sql` then `supabase/functions.sql` in the Supabase SQL editor.
3. Create Storage buckets: `documents`, `uploads`. Both private.
4. Connect Netlify to the repo. Set env vars from `.env.example`.
5. Deploy.

**Phase 2 — First admin user:**
1. Supabase → Auth → Users → add your email.
2. SQL editor: insert a row in `users` with role `admin`.
3. Log in. Run a test intake.

That's the entire deploy. No Windows-side install, no PM2 addition, no tunnel, no Paperclip config.

---

## 11. What you still decide later

- Wire Docusign into the bid detail page for signature flows.
- Custom domain vs `*.netlify.app`.
- SF 1449 / SF 33 real fillable PDF mapping.
- Bulk CSV export for mentor pipelines.
- Whether autonomous SAM.gov submission is worth building (marginal given the human review gate).

---

## 12. Cost envelope

| Item | Monthly |
|---|---|
| Netlify free tier | $0 |
| Supabase free tier | $0 |
| Claude Haiku (~30 bids × ~$0.10) | ~$3–$10 |
| Domain (optional) | ~$1 |
| **Total** | **~$5–$12** |

---

---

## 13. v3 reliability upgrades

v3 is a hardening pass — no new features, just making the existing stack more resilient for production use during bid deadlines.

**Input validation:** Every API route uses `parseOrRespond()` from `src/lib/validation.ts` with Zod schemas. Malformed requests get a structured 400 with field-level error messages instead of a 500.

**Supabase client split:** `supabase.ts` is server-only (imports `next/headers`). Client components import from `supabase-browser.ts` instead. This prevents Next.js from bundling server code into the browser.

**LLM retry logic:** `callHaiku()` in `llm.ts` retries on 429, 529, and 5xx errors with 2s/4s backoff (two retries max). Anthropic rate limits won't crash the portal.

**Field sanitization:** The intake prefill route trims extracted strings and caps them at 2000 characters to prevent oversized or whitespace-padded values from Haiku extraction.

**Error boundaries:** `error.tsx` catches page-level React errors with a "Try again" button. `global-error.tsx` catches root layout failures with its own `<html>` shell.

**404 pages:** `not-found.tsx` (global) and `bids/[id]/not-found.tsx` (bid-specific, linked from `notFound()` call in bid detail page).

**Loading skeletons:** Pulse-animated skeleton screens for dashboard, bids list, bid detail, and companies. Users see structure instead of a blank page during server component loads.

**Deadline alerts:** Dashboard shows an amber banner listing bids due within 7 days.

**Supplementary indexes:** `supabase/indexes.sql` adds `documents(company_id)` and `bid_events(actor_id)` for query patterns missed in the original schema.

---

**Next:** `README_START_HERE.md` for the 5-minute setup.
