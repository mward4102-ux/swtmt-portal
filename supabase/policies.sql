-- Row-Level Security (BUILD_SPEC §5, §13).
-- Customers see only their own rows; agents see all. The service-role key
-- (functions only) bypasses RLS for server-side writes.

-- Helper: is the current user an agent?
create or replace function public.is_agent()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'agent');
$$;

alter table profiles      enable row level security;
alter table leads         enable row level security;
alter table documents     enable row level security;
alter table quotes        enable row level security;
alter table quote_lines   enable row level security;
alter table appointments  enable row level security;
alter table audit_log     enable row level security;

-- Profiles: a user sees/edits their own; agents see all.
create policy profiles_self_read on profiles for select using (id = auth.uid() or public.is_agent());
create policy profiles_self_upsert on profiles for insert with check (id = auth.uid());
create policy profiles_self_update on profiles for update using (id = auth.uid());

-- Leads
create policy leads_read on leads for select using (owner_user_id = auth.uid() or public.is_agent());
create policy leads_write on leads for insert with check (owner_user_id = auth.uid() or public.is_agent());
create policy leads_update on leads for update using (owner_user_id = auth.uid() or public.is_agent());

-- Documents
create policy documents_read on documents for select using (owner_user_id = auth.uid() or public.is_agent());
create policy documents_write on documents for insert with check (owner_user_id = auth.uid() or public.is_agent());
create policy documents_update on documents for update using (owner_user_id = auth.uid() or public.is_agent());

-- Quotes
create policy quotes_read on quotes for select using (owner_user_id = auth.uid() or public.is_agent());
create policy quotes_write on quotes for insert with check (owner_user_id = auth.uid() or public.is_agent());
create policy quotes_update on quotes for update using (owner_user_id = auth.uid() or public.is_agent());

-- Quote lines (inherit access from parent quote)
create policy quote_lines_read on quote_lines for select using (
  exists (select 1 from quotes q where q.id = quote_id and (q.owner_user_id = auth.uid() or public.is_agent()))
);
create policy quote_lines_write on quote_lines for insert with check (
  exists (select 1 from quotes q where q.id = quote_id and (q.owner_user_id = auth.uid() or public.is_agent()))
);

-- Appointments
create policy appts_read on appointments for select using (owner_user_id = auth.uid() or public.is_agent());
create policy appts_write on appointments for insert with check (owner_user_id = auth.uid() or public.is_agent());

-- Audit log: agents read; anyone authenticated may append their own action.
create policy audit_read on audit_log for select using (public.is_agent());
create policy audit_write on audit_log for insert with check (actor_id = auth.uid() or actor_id is null);
