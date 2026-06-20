# Beach Stanton Insurance — customer PWA + agent dashboard

A customer-facing installable PWA for an **independent** insurance agency: clients
build a profile, upload current policy documents that are **AI-scanned and
field-extracted**, request quotes across every line, and book appointments — plus
an **agent dashboard** that turns all of it into ready-to-fill **ACORD** paperwork.

Built to beat the State Farm app on the *front door* (AI intake, multi-carrier,
scheduling), not on carrier-backend features an independent can't replicate.

> **Runs out of the box in demo mode** — no Supabase, no API keys, no setup. It
> uses an in-memory store seeded from the 8 fictitious sample documents and never
> persists real PII. Every external integration is wired behind its own
> credential, so going live is "flip the switch," not a rewrite.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000   (or: npm run build && npm run start)
```

No `.env` needed. On the landing page, use the two demo buttons:

- **Explore as a customer** → Maria Gutierrez (auto + license + a live quote).
- **Open the agent dashboard** → Beach Stanton (inbox, extractions, forms).

Magic-link sign-in also works — any email signs in as a customer.

### Try the marquee flow
1. As a customer → **Documents** → *Try a sample* → pick **Pacific Crest — Auto**.
2. Watch it classify + extract every field with a **confidence score**; low-confidence
   fields are highlighted for review. Edit anything, then **Confirm & save**.
3. As the agent → **Dashboard** → open a lead → **Generate forms** → download a
   filled **ACORD 125** (and a Granite Peak carrier supplement for Desert Bloom).

---

## What's implemented (maps to the build spec)

| Area | Where | Spec |
|---|---|---|
| Canonical model (extract once, fill anything) | `lib/canonical.ts` | §6 |
| Extraction tool schema (generated from the model) | `lib/extraction-schema.ts` | §6b |
| Extraction (sample-match → Claude vision → demo) | `lib/extraction/extract.ts`, `app/api/extract` | §6c |
| Dynamic carrier-matching + ACORD fill | `lib/forms/*`, `forms/field-maps/*.json` | §7 |
| Quote intake (4 lines, save-and-resume, autofill) | `components/quote/QuoteWizard.tsx` | §8 |
| Scheduling (Cal.com embed or built-in) | `components/schedule/Scheduler.tsx`, `app/api/cal/webhook` | §9 |
| Agent dashboard + lead detail | `app/(agent)/*` | §10 |
| Notifications (Resend/Twilio + in-app outbox) | `lib/notify.ts`, `lib/email-templates.ts` | §11 |
| PWA (manifest + service worker + icons) | `public/manifest.json`, `public/sw.js` | §12 |
| Security: RLS, signed file access, audit log, PII gate | `supabase/policies.sql`, `app/api/documents/[id]/file`, store audit | §13 |
| AMS / rater seam | `lib/integrations/ams.ts` | §18 |

**Backend rule honored:** all AI/extraction/fill/notify logic is server-side
(route handlers under `app/api/**`), run on Node 20 by `@netlify/plugin-nextjs`.

---

## Demo mode vs. live

Everything keys off the presence of credentials (`lib/config.ts`):

| Integration | Demo behavior | Make it live |
|---|---|---|
| Data / auth | In-memory seeded store; signed-cookie session | Set `NEXT_PUBLIC_SUPABASE_URL` + keys; run `supabase/*.sql`; implement a `SupabaseStore` (mirrors `lib/db/store.ts`) and return it from `getDb()` |
| AI extraction | Known samples return exact records; unknown uploads return a labelled demo extraction | Set `ANTHROPIC_API_KEY` → real `claude-sonnet-4-6` vision extraction on any upload |
| Scheduling | Built-in date/time picker writes an appointment | Set `NEXT_PUBLIC_CAL_LINK` (embed) + `CAL_WEBHOOK_SECRET` |
| Email | Recorded in the agent "Notifications sent" outbox | Set `RESEND_API_KEY` |
| SMS | Off | `SMS_ENABLED=true` + Twilio creds |

Copy `.env.example` → `.env.local` and fill what you need. **The data layer is the
only switch site** — nothing else in the app talks to a backend directly.

---

## ACORD forms

ACORD PDFs are copyrighted and supplied by Beach via his ACORD/AMS subscription.
The app **fills** them; it does not reproduce them.

- Until you drop an official PDF in, the fill engine renders a **faithful
  ACORD-format facsimile** (real ACORD 25 / 125 / 37 / 36 layouts, plus
  ACORD-styled personal-auto & homeowner applications — `lib/forms/acord/`)
  filled from canonical, so "Generate forms" produces a real, on-form PDF today.
- To use an official form: save it as `forms/<form_id>.pdf`, read its true field
  names, and update `forms/field-maps/<form>.json`. See **`forms/README.md`**.
- **Add a carrier with zero code:** drop a `field-maps/*.json` with
  `"applies_to": { "carriers": [...] }` and its PDF — the matcher picks it up.

---

## Security & the PII switch

Even with no PII in v1, the controls are built so the switch is flip-only:

- **RLS** on every table (`supabase/policies.sql`): customers see only their rows;
  agents see all. The service-role key lives only in server functions.
- **Signed/auth-gated file access** (`/api/documents/[id]/file`) — never public buckets.
- **Audit log** written on every scan, save, review, form generation, and status change.
- **`PII_STORAGE_ENABLED=false`** (default): upload binaries are dropped after
  extraction; license #/DOB/full address aren't persisted beyond the session.

**Before storing real customers** (documented gate, not built in v1): app-layer
envelope encryption for sensitive columns, SSN tokenization, a retention policy,
and a delete-my-data endpoint.

---

## Scripts & tests

```bash
npm run dev               # dev server
npm run build             # production build
npm run start             # run the production build
npm run typecheck         # tsc --noEmit
npm run test:extraction   # §16 extraction acceptance self-check (34 assertions)
npm run gen:icons         # regenerate PWA icons from the inline SVG mark
```

The 8 fictitious sample PDFs live in `samples/` (served only via the auth-gated
file route). `npm run test:extraction` asserts the §16 anchor table.

---

## iOS / Android (phase 2)

The PWA is store-wrappable with Capacitor with no rewrite — no web-only APIs were
used without a Capacitor equivalent (document capture uses
`<input type="file" accept="image/*" capture="environment">`). Add `@capacitor/core`,
`@capacitor/camera`, `@capacitor/push-notifications`, `@capacitor/preferences`.

---

## Deploy

Netlify is preconfigured (`netlify.toml` + `@netlify/plugin-nextjs`). Connect the
repo, set any env vars you want live, and deploy. The app also runs on Vercel or
any Node host (`npm run build && npm run start`).

## First dependencies to get from Beach
1. Official fillable ACORD PDFs for his lines → drop in `forms/`.
2. Which AMS / comparative rater (decides `lib/integrations/ams.ts`).
3. Agency license #s and the exact bookable event types.
