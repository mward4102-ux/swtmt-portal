# SWTMT Portal — Start Here (v3)

Two things in this package:

1. **`SWTMT_PORTAL_ARCHITECTURE.md`** — the full architecture doc. Read first.
2. **`swtmt-portal/`** — the Next.js web app. Deploys to Netlify. That's the whole system.

No Windows installer, no relay service, no Paperclip agent prompt. Three-service stack: Netlify + Supabase + Claude Haiku.

## What changed in v3 (reliability upgrades)

- **Zod validation** on every API route via `parseOrRespond()` — bad input returns structured 400 errors instead of crashing.
- **Supabase client split** — `supabase.ts` is server-only (uses `next/headers`), `supabase-browser.ts` is for `'use client'` pages. No more bundler issues.
- **LLM retry logic** — Haiku calls retry on 429/529/5xx with 2s/4s backoff before failing.
- **Deadline alerts** — dashboard shows bids due within 7 days in an amber banner.
- **Field sanitization** — prefill extraction trims strings and caps field length.
- **Error boundaries** — `error.tsx` (page-level) and `global-error.tsx` (root-level) catch React errors gracefully.
- **404 pages** — global `not-found.tsx` and bid-specific `bids/[id]/not-found.tsx`.
- **Loading skeletons** — `loading.tsx` for dashboard, bids, bid detail, and companies.
- **Supplementary indexes** — `supabase/indexes.sql` adds `documents(company_id)` and `bid_events(actor_id)`.

---

## 5-minute setup

### Step 1 — Supabase
Go to https://supabase.com → new project → name it `swtmt-portal`. Save these three values:
- Project URL
- `anon` key
- `service_role` key (keep secret)

In the SQL editor, run these in order:
1. `swtmt-portal/supabase/schema.sql`
2. `swtmt-portal/supabase/functions.sql`
3. `swtmt-portal/supabase/indexes.sql` (v3 supplementary indexes)

In Storage, create two buckets: `documents` and `uploads`. Make both private.

### Step 2 — Push to GitHub + Netlify
```powershell
cd swtmt-portal
git init
git add .
git commit -m "SWTMT portal initial scaffold"
git remote add origin https://github.com/YOU/swtmt-portal.git
git push -u origin main
```

Connect Netlify to the repo. Set these env vars in Netlify:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
LLM_MONTHLY_CAP_USD=25
```

Deploy. You'll get a `*.netlify.app` URL.

### Step 3 — Create your admin user
In Supabase → Authentication → Users → Add User → use your email. Then in SQL editor:
```sql
insert into users (id, email, role, full_name, is_veteran)
values ('<paste the auth user id>', 'mward4102@gmail.com', 'admin', 'Michael Ward', true);
```

Log in to the portal. You should see the empty dashboard.

### Step 4 — Test the intake prefill
1. Go to `/intake`
2. Drop the Leading Valor Connections capability statement PDF (or any existing bid doc) into the upload zone
3. Fields should auto-populate within 10–15 seconds
4. Review, fix anything, submit
5. Check `/bids` — your first bid is in the kanban with a generated capability statement attached

Done. You now have a working portal.

---

## What works out of the box

- Magic-link login with role-based routing
- Upload existing documents → Haiku extracts and prefills the intake form
- Schema-driven intake form (add fields by editing the schema, no code)
- Bids kanban pipeline with every stage
- Capability statement generator (Haiku enriches differentiators)
- SF 1449 skeleton cover draft
- Chatbot slide-out on every page (routes to DB or Haiku automatically)
- Budget enforcement (blocks Haiku at monthly cap)
- Document storage with signed download URLs
- Row-level security (admin / mentor / operator isolation)

## What's stubbed for you to extend

- Real fillable SF 1449 / SF 33 / SF 18 / SF 30 PDF mapping — skeleton generators exist with `TODO:` markers pointing to the extension path via `pdf-lib`
- Docusign e-signature flow on the bid detail page (connector already in your toolset)
- CSV export for mentor pipelines
- Fine-grained notification preferences

Every stubbed file has a `TODO:` comment marking where to extend.

---

## When something breaks

Paste the error into a new chat with me and reference "swtmt-portal v3". Keep `SWTMT_PORTAL_ARCHITECTURE.md` as your reference for where new features belong.
