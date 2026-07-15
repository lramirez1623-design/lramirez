-- FinanceHub Luis: run this in Supabase SQL Editor after creating your project.
create table if not exists public.financial_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_date date not null,
  entry_type text check (entry_type in ('Ingreso','Gasto')) not null,
  category text not null,
  description text not null default '',
  amount numeric(14,2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null, balance numeric(14,2) not null default 0,
  payment numeric(14,2) not null default 0, rate numeric(8,3) not null default 0,
  priority integer not null default 99, created_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null, value numeric(14,2) not null default 0,
  payment numeric(14,2) not null default 0, monthly_income numeric(14,2) not null default 0,
  operating_cost numeric(14,2) not null default 0, note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.financial_entries enable row level security;
alter table public.debts enable row level security;
alter table public.vehicles enable row level security;

create policy "Own entries" on public.financial_entries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own debts" on public.debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own vehicles" on public.vehicles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
