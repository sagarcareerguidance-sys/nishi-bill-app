-- Nishi Trading Company Bill Generator
-- Run this once in Supabase SQL Editor.

create table if not exists public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_no text not null,
  bill_date date,
  customer text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bills_user_invoice_unique unique (user_id, invoice_no)
);

create index if not exists bills_user_updated_idx
  on public.bills (user_id, updated_at desc);

alter table public.bills enable row level security;

drop policy if exists "Users can read own bills" on public.bills;
create policy "Users can read own bills"
on public.bills for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own bills" on public.bills;
create policy "Users can insert own bills"
on public.bills for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own bills" on public.bills;
create policy "Users can update own bills"
on public.bills for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own bills" on public.bills;
create policy "Users can delete own bills"
on public.bills for delete
to authenticated
using (auth.uid() = user_id);

create table if not exists public.company_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.company_settings enable row level security;

drop policy if exists "Users can read own settings" on public.company_settings;
create policy "Users can read own settings"
on public.company_settings for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own settings" on public.company_settings;
create policy "Users can insert own settings"
on public.company_settings for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own settings" on public.company_settings;
create policy "Users can update own settings"
on public.company_settings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

grant select, insert, update, delete on table public.bills to authenticated;
grant select, insert, update on table public.company_settings to authenticated;
