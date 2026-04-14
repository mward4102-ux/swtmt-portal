-- SWTMT Portal — Phase A schema extensions
-- Multi-agent bid drafting: solicitations, sections, research, pricing, past performance, agent runs.
-- Run AFTER schema.sql and functions.sql in the Supabase SQL editor.
-- Safe to re-run — uses IF NOT EXISTS / exception handlers throughout.

-- ─────────────────────────────────────────────────────────
-- NEW ENUM: bid section status lifecycle
-- ─────────────────────────────────────────────────────────
do $$ begin
  create type bid_section_status as enum (
    'pending','researching','drafting','critiquing','revised','draft_ready','approved','rejected'
  );
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────
-- EXTEND doc_kind enum with Phase A document types
-- ─────────────────────────────────────────────────────────
do $$ begin
  alter type doc_kind add value if not exists 'full_bid';
  alter type doc_kind add value if not exists 'solicitation_source';
  alter type doc_kind add value if not exists 'pricing_memo';
  alter type doc_kind add value if not exists 'research_brief';
exception when others then null; end $$;

-- ─────────────────────────────────────────────────────────
-- SOLICITATIONS — extracted structured data from uploaded RFP/RFQ/Sources Sought
-- ─────────────────────────────────────────────────────────
create table if not exists solicitations (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid references bids(id) on delete cascade,
  source_filename text,
  source_storage_path text,
  raw_text text,
  agency text,
  sub_agency text,
  solicitation_number text,
  contract_type text,
  naics text,
  psc_code text,
  set_aside text,
  due_date timestamptz,
  place_of_performance text,
  estimated_value text,
  period_of_performance text,
  extracted_requirements jsonb default '[]'::jsonb,
  evaluation_criteria jsonb default '[]'::jsonb,
  win_themes jsonb default '[]'::jsonb,
  incumbent_analysis jsonb,
  created_at timestamptz default now()
);
create index if not exists solicitations_bid_id_idx on solicitations(bid_id);

-- ─────────────────────────────────────────────────────────
-- BID SECTIONS — individual proposal sections with drafting lifecycle
-- ─────────────────────────────────────────────────────────
create table if not exists bid_sections (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid references bids(id) on delete cascade,
  section_key text not null,
  section_title text not null,
  section_order int not null,
  status bid_section_status default 'pending',
  model_used text,
  content text,
  critique text,
  revision_notes text,
  word_count int,
  generation_prompt text,
  cost_usd numeric(10,4) default 0,
  generated_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references users(id),
  created_at timestamptz default now()
);
create index if not exists bid_sections_bid_id_idx on bid_sections(bid_id);
create unique index if not exists bid_sections_unique_idx on bid_sections(bid_id, section_key);

-- ─────────────────────────────────────────────────────────
-- RESEARCH BRIEFS — synthesized competitive intelligence per bid
-- ─────────────────────────────────────────────────────────
create table if not exists research_briefs (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid references bids(id) on delete cascade,
  agency_intel jsonb,
  historical_awards jsonb,
  incumbent_analysis jsonb,
  pricing_benchmarks jsonb,
  market_context jsonb,
  raw_sources jsonb,
  total_cost_usd numeric(10,4) default 0,
  created_at timestamptz default now()
);
create index if not exists research_briefs_bid_id_idx on research_briefs(bid_id);

-- ─────────────────────────────────────────────────────────
-- PRICING ANALYSES — three-tier pricing model per bid
-- ─────────────────────────────────────────────────────────
create table if not exists pricing_analyses (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid references bids(id) on delete cascade,
  aggressive_price numeric(15,2),
  target_price numeric(15,2),
  conservative_price numeric(15,2),
  pricing_methodology text,
  comparable_awards jsonb,
  labor_category_estimates jsonb,
  indirect_rate_assumptions jsonb,
  fee_structure text,
  total_cost_usd numeric(10,4) default 0,
  created_at timestamptz default now()
);
create index if not exists pricing_analyses_bid_id_idx on pricing_analyses(bid_id);

-- ─────────────────────────────────────────────────────────
-- PAST PERFORMANCE RECORDS — reusable library per company
-- ─────────────────────────────────────────────────────────
create table if not exists past_performance_records (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  customer_name text not null,
  customer_type text,
  contract_number text,
  period_of_performance_start date,
  period_of_performance_end date,
  contract_value numeric(15,2),
  scope text,
  outcome text,
  relevant_naics text[],
  poc_name text,
  poc_email text,
  poc_phone text,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists past_performance_company_idx on past_performance_records(company_id);

-- ─────────────────────────────────────────────────────────
-- BID AGENT RUNS — audit trail for every agent invocation
-- ─────────────────────────────────────────────────────────
create table if not exists bid_agent_runs (
  id uuid primary key default gen_random_uuid(),
  bid_id uuid references bids(id) on delete cascade,
  agent_name text not null,
  status text not null,
  input_summary text,
  output_summary text,
  error text,
  cost_usd numeric(10,4) default 0,
  duration_ms int,
  created_at timestamptz default now()
);
create index if not exists bid_agent_runs_bid_id_idx on bid_agent_runs(bid_id);

-- ─────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────
alter table solicitations enable row level security;
alter table bid_sections enable row level security;
alter table research_briefs enable row level security;
alter table pricing_analyses enable row level security;
alter table past_performance_records enable row level security;
alter table bid_agent_runs enable row level security;

-- Admin sees all
create policy "admin_all_solicitations" on solicitations for all using (auth_role() = 'admin');
create policy "admin_all_bid_sections" on bid_sections for all using (auth_role() = 'admin');
create policy "admin_all_research_briefs" on research_briefs for all using (auth_role() = 'admin');
create policy "admin_all_pricing_analyses" on pricing_analyses for all using (auth_role() = 'admin');
create policy "admin_all_past_performance" on past_performance_records for all using (auth_role() = 'admin');
create policy "admin_all_agent_runs" on bid_agent_runs for all using (auth_role() = 'admin');

-- Operators: own company's data only
create policy "operator_own_solicitations" on solicitations for select using (
  bid_id in (select id from bids where company_id = auth_company())
);
create policy "operator_own_bid_sections" on bid_sections for select using (
  bid_id in (select id from bids where company_id = auth_company())
);
create policy "operator_own_research_briefs" on research_briefs for select using (
  bid_id in (select id from bids where company_id = auth_company())
);
create policy "operator_own_pricing_analyses" on pricing_analyses for select using (
  bid_id in (select id from bids where company_id = auth_company())
);
create policy "operator_own_past_performance" on past_performance_records for all using (
  company_id = auth_company()
);
create policy "operator_own_agent_runs" on bid_agent_runs for select using (
  bid_id in (select id from bids where company_id = auth_company())
);
