-- Beach Stanton Insurance — Postgres schema (BUILD_SPEC §2, §6, §13).
--
-- The app runs in demo mode against an in-memory store with NONE of this. This
-- schema is the "flip the switch" target: create these tables, implement a
-- SupabaseStore mirroring lib/db/store.ts, and set the Supabase env vars.
--
-- PII columns exist now but are gated behind PII_STORAGE_ENABLED at the app
-- layer: when false, binaries are dropped post-extraction and license #/DOB/full
-- address are not persisted beyond the active session.

create extension if not exists "pgcrypto";

-- ── Profiles (mirrors auth.users) ────────────────────────────────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null default 'customer' check (role in ('customer','agent')),
  phone       text,
  created_at  timestamptz not null default now()
);

-- ── Leads (one per resolved person/business) ─────────────────────────────────
create table if not exists leads (
  id              uuid primary key default gen_random_uuid(),
  kind            text not null default 'person' check (kind in ('person','business')),
  display_name    text not null,
  normalized_name text not null default '',
  owner_user_id   uuid references profiles(id) on delete set null,
  status          text not null default 'new' check (status in ('new','in_progress','quoted','closed')),
  primary_address text,
  email           text,
  phone           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Documents (canonical record stored as jsonb) ─────────────────────────────
create table if not exists documents (
  id                 uuid primary key default gen_random_uuid(),
  lead_id            uuid not null references leads(id) on delete cascade,
  owner_user_id      uuid references profiles(id) on delete set null,
  file_name          text not null,
  doc_type           text not null,
  mime               text not null default 'application/pdf',
  size_bytes         integer not null default 0,
  record             jsonb not null,            -- the CanonicalRecord
  binary_path        text,                      -- Supabase Storage object (signed access only)
  binary_retained    boolean not null default false,
  sample_id          text,
  source             text not null default 'upload',
  reviewed           boolean not null default false,
  overall_confidence numeric not null default 0,
  needs_review       boolean not null default true,
  created_at         timestamptz not null default now()
);

-- ── Quotes + lines ───────────────────────────────────────────────────────────
create table if not exists quotes (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid not null references leads(id) on delete cascade,
  owner_user_id uuid references profiles(id) on delete set null,
  status        text not null default 'submitted',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists quote_lines (
  id         uuid primary key default gen_random_uuid(),
  quote_id   uuid not null references quotes(id) on delete cascade,
  line       text not null check (line in ('personal_auto','homeowners','commercial','life_health')),
  data       jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ── Appointments ─────────────────────────────────────────────────────────────
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  lead_id       uuid references leads(id) on delete set null,
  owner_user_id uuid references profiles(id) on delete set null,
  event_type    text not null,
  name          text not null,
  email         text not null,
  phone         text,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  notes         text,
  source        text not null default 'demo',
  status        text not null default 'booked' check (status in ('booked','completed','canceled')),
  created_at    timestamptz not null default now()
);

-- ── Audit log (write on every extraction, form gen, status change) ───────────
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles(id) on delete set null,
  actor_email text not null default '',
  action      text not null,
  entity      text not null,
  entity_id   text not null,
  meta        jsonb,
  at          timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
create index if not exists idx_leads_owner    on leads(owner_user_id);
create index if not exists idx_leads_status    on leads(status);
create index if not exists idx_documents_lead  on documents(lead_id);
create index if not exists idx_documents_owner on documents(owner_user_id);
create index if not exists idx_quotes_lead     on quotes(lead_id);
create index if not exists idx_quotes_owner    on quotes(owner_user_id);
create index if not exists idx_quote_lines_q   on quote_lines(quote_id);
create index if not exists idx_appts_owner     on appointments(owner_user_id);
create index if not exists idx_appts_lead      on appointments(lead_id);
create index if not exists idx_audit_entity    on audit_log(entity, entity_id);
