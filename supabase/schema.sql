-- Helio — suppliers table (fase 6 backend).
-- Run this once in the Supabase SQL editor, then run seed.sql.
-- Columns are snake_case; the app maps them to the camelCase Supplier type.

create table if not exists public.suppliers (
  id          text primary key,
  name        text not null,
  country     text not null,                 -- ISO-2, e.g. "DE"
  category    text not null,
  segment     text not null check (segment in ('Strategic','Bottleneck','Leverage','Routine')),
  tier        smallint not null check (tier between 1 and 3),
  scorecard   smallint not null,             -- 0..100 composite
  risk_score  smallint not null,             -- 0..100
  on_time_pct numeric(5,1) not null,
  quality_pct smallint not null,
  ncrs        smallint not null default 0,
  spend       text not null,                 -- display string, e.g. "€4.2M"
  spend_eur   bigint not null,               -- numeric, for sums/sorting
  trend       jsonb not null default '[]',   -- ~12 risk-history points
  change      text,                          -- 30d risk delta, e.g. "+18"
  reason      text,                          -- short human reason
  created_at  timestamptz not null default now()
);

-- Row-level security: this is a public read-only demo dataset with open insert
-- so the "Add supplier" flow works without auth. Tighten before real use.
alter table public.suppliers enable row level security;

drop policy if exists "suppliers public read" on public.suppliers;
create policy "suppliers public read"
  on public.suppliers for select
  using (true);

drop policy if exists "suppliers public insert" on public.suppliers;
create policy "suppliers public insert"
  on public.suppliers for insert
  with check (true);
