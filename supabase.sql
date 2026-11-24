create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null default 'Partida',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.campaigns enable row level security;
create policy "own select" on public.campaigns for select using (user_id = auth.uid());
create policy "own insert" on public.campaigns for insert with check (user_id = auth.uid());
create policy "own update" on public.campaigns for update using (user_id = auth.uid());
create policy "own delete" on public.campaigns for delete using (user_id = auth.uid());
