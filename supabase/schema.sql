-- Supabase Schema for Horizon Auto PC
-- Create user_builds table to store Saved Builds and History bound to user_id

create table if not exists public.user_builds (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  build_name text not null,
  budget integer not null,
  total_price integer not null,
  luck_score integer not null,
  luck_tier text not null,
  rarity text not null,
  special_build jsonb,
  scores jsonb not null,
  parts jsonb not null,
  analysis jsonb not null,
  estimated_fps jsonb,
  is_saved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.user_builds enable row level security;

-- Policy 1: Users can view only their own builds
create policy "Users can view own builds"
  on public.user_builds for select
  using (auth.uid() = user_id);

-- Policy 2: Users can insert their own builds
create policy "Users can insert own builds"
  on public.user_builds for insert
  with check (auth.uid() = user_id);

-- Policy 3: Users can update their own builds (e.g. toggle is_saved)
create policy "Users can update own builds"
  on public.user_builds for update
  using (auth.uid() = user_id);

-- Policy 4: Users can delete their own builds
create policy "Users can delete own builds"
  on public.user_builds for delete
  using (auth.uid() = user_id);

-- Index for fast user queries
create index if not exists idx_user_builds_user_id on public.user_builds(user_id);
create index if not exists idx_user_builds_created_at on public.user_builds(created_at desc);
