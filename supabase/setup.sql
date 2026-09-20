-- Piano Accounts — Supabase setup
-- Paste this whole file into: Supabase dashboard -> SQL Editor -> New query -> Run
-- Expected result: "Success. No rows returned."

-- 1) One JSONB row per user = their whole app data ("cloud data.json")
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 2) Turn on Row-Level Security (this is what protects the data)
alter table public.user_data enable row level security;

-- 3) Policies: each user can only read/write their OWN row
create policy "own row - select" on public.user_data
  for select using (auth.uid() = user_id);

create policy "own row - insert" on public.user_data
  for insert with check (auth.uid() = user_id);

create policy "own row - update" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4) Private bucket for receipt photos
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- 5) Users can only touch their own receipts folder ({user_id}/...)
create policy "own receipts" on storage.objects
  for all using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
