-- SWTMT Portal — Supabase schema
-- Run this in the Supabase SQL editor after creating the project.

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
create type user_role as enum ('admin', 'mentor', 'operator');
create type bid_stage as enum (
  'opportunity','intake','drafting','review','submitted',
  'awarded','lost','fulfillment','closeout'
);
create type intake_status as enum ('draft','submitted','processed','rejected');
create type doc_kind as enum (
  'capability_statement','sf1449','sf33','sf18','sf30',
  'past_performance','pricing','technical_volume','other'
);
create type doc_generator as enum ('template','haiku','manual');

-- ─────────────────────────────────────────────────────────────
-- COMPANIES
-- ─────────────────────────────────────────────────────────────
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ein text,
  cage_code text,
  uei text,
  sam_status text,
  naics text[] default '{}',
  sdvosb_certified boolean default false,
  mentor_id uuid references companies(id),
  owner_user_id uuid,
  created_at timestamptz default now()
);
create index on companies (mentor_id);

-- ─────────────────────────────────────────────────────────────
-- USERS (extends auth.users)
-- ─────────────────────────────────────────────────────────────
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role user_role not null default 'operator',
  company_id uuid references companies(id),
  full_name text,
  is_veteran boolean default false,
  created_at timestamptz default now()
);

-- Helper function used in policies
create or replace function auth_role() returns user_role
  language sql stable as $$
    select role from users where id = auth.uid()
  $$;

create or replace function auth_company() returns uuid
  language sql stable as $$
    select company_id from users where id = auth.uid()
  $$;

-- ─────────────────────────────────────────────────────────────
-- INTAKES
-- ─────────────────────────────────────────────────────────────
create table intakes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id),
  submitted_by uuid references users(id),
  raw_json jsonb not null,
  status intake_status default 'submitted',
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- BIDS
-- ─────────────────────────────────────────────────────────────
create table bids (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) not null,
  solicitation_number text,
  agency text,
  title text not null,
  naics text,
  due_date timestamptz,
  stage bid_stage default 'opportunity',
  assigned_to uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on bids (company_id, stage);
create index on bids (due_date);

-- ─────────────────────────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────────────────────────
create table documents (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid references bids(id) on delete cascade,
  company_id uuid references companies(id) not null,
  kind doc_kind not null,
  filename text not null,
  storage_path text not null,
  generator doc_generator not null,
  generated_by uuid references users(id),
  version int default 1,
  created_at timestamptz default now()
);
create index on documents (bid_id);

-- ─────────────────────────────────────────────────────────────
-- BID EVENTS (audit trail)
-- ─────────────────────────────────────────────────────────────
create table bid_events (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid references bids(id) on delete cascade,
  actor_id uuid references users(id),
  event_type text not null,
  payload jsonb,
  created_at timestamptz default now()
);
create index on bid_events (bid_id, created_at desc);

-- ─────────────────────────────────────────────────────────────
-- CHAT
-- ─────────────────────────────────────────────────────────────
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  company_id uuid references companies(id),
  title text,
  created_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references chat_sessions(id) on delete cascade,
  role text not null,
  content text not null,
  model text,
  tokens int,
  created_at timestamptz default now()
);
create index on chat_messages (session_id, created_at);

-- ─────────────────────────────────────────────────────────────
-- LLM USAGE (budget enforcement)
-- ─────────────────────────────────────────────────────────────
create table llm_usage (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  model text not null,
  tokens_in int default 0,
  tokens_out int default 0,
  cost_usd numeric(10,4) default 0,
  updated_at timestamptz default now()
);
create unique index on llm_usage (month, model);

-- ─────────────────────────────────────────────────────────────
-- TEMPLATES
-- ─────────────────────────────────────────────────────────────
create table templates (
  id uuid primary key default gen_random_uuid(),
  kind doc_kind not null,
  name text not null,
  schema_json jsonb not null,
  body text not null,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────
alter table companies     enable row level security;
alter table users         enable row level security;
alter table intakes       enable row level security;
alter table bids          enable row level security;
alter table documents     enable row level security;
alter table bid_events    enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table llm_usage     enable row level security;
alter table templates     enable row level security;

-- Admin sees all, everywhere
create policy "admin_all_companies"     on companies     for all using (auth_role() = 'admin');
create policy "admin_all_users"         on users         for all using (auth_role() = 'admin');
create policy "admin_all_intakes"       on intakes       for all using (auth_role() = 'admin');
create policy "admin_all_bids"          on bids          for all using (auth_role() = 'admin');
create policy "admin_all_documents"     on documents     for all using (auth_role() = 'admin');
create policy "admin_all_bid_events"    on bid_events    for all using (auth_role() = 'admin');
create policy "admin_all_chat_sessions" on chat_sessions for all using (auth_role() = 'admin');
create policy "admin_all_chat_messages" on chat_messages for all using (auth_role() = 'admin');
create policy "admin_all_llm_usage"     on llm_usage     for all using (auth_role() = 'admin');
create policy "admin_all_templates"     on templates     for all using (auth_role() = 'admin');

-- Operators: only their own company's data
create policy "operator_own_company_bids" on bids
  for select using (company_id = auth_company());
create policy "operator_own_company_docs" on documents
  for select using (company_id = auth_company());
create policy "operator_own_company_intakes" on intakes
  for all using (company_id = auth_company());
create policy "operator_own_chat" on chat_sessions
  for all using (user_id = auth.uid());
create policy "operator_own_messages" on chat_messages
  for all using (
    session_id in (select id from chat_sessions where user_id = auth.uid())
  );
create policy "everyone_sees_self" on users
  for select using (id = auth.uid() or auth_role() = 'admin');

-- Mentors: their own company + any protégé whose mentor_id points to them
create policy "mentor_protege_bids" on bids
  for select using (
    auth_role() = 'mentor'
    and company_id in (
      select id from companies
      where id = auth_company() or mentor_id = auth_company()
    )
  );
create policy "mentor_protege_docs" on documents
  for select using (
    auth_role() = 'mentor'
    and company_id in (
      select id from companies
      where id = auth_company() or mentor_id = auth_company()
    )
  );
create policy "mentor_protege_companies" on companies
  for select using (
    auth_role() = 'mentor'
    and (id = auth_company() or mentor_id = auth_company())
  );

-- Templates: readable by everyone logged in
create policy "all_read_templates" on templates
  for select using (auth.uid() is not null);
