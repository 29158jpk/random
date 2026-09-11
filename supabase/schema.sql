-- ==============================================================================
-- HORIZON AUTO PC - COMPLETE SUPABASE SCHEMA & SECURITY POLICIES
-- Includes: profiles, user_builds, daily_challenges, challenge_participants,
--           hardware, admin_logs, member_activities, is_admin() function & RLS
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  email text not null,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')) not null,
  status text default 'active' check (status in ('active', 'suspended')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index on profiles
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);
create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_profiles_username on public.profiles(username);

-- 2. USER BUILDS TABLE
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

create index if not exists idx_user_builds_user_id on public.user_builds(user_id);
create index if not exists idx_user_builds_created_at on public.user_builds(created_at desc);
create index if not exists idx_user_builds_is_saved on public.user_builds(is_saved);
create index if not exists idx_user_builds_rarity on public.user_builds(rarity);

-- 3. DAILY CHALLENGES TABLE
create table if not exists public.daily_challenges (
  id text primary key,
  title text not null,
  description text not null,
  budget integer not null,
  usage text default 'gaming' not null,
  target_score integer default 70 not null,
  start_date date default current_date not null,
  end_date date default (current_date + interval '1 day') not null,
  status text default 'active' check (status in ('active', 'disabled', 'expired')) not null,
  constraints jsonb default '{}'::jsonb,
  reward_title text default 'Challenge Conqueror',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_daily_challenges_status on public.daily_challenges(status);
create index if not exists idx_daily_challenges_dates on public.daily_challenges(start_date, end_date);

-- 4. CHALLENGE PARTICIPANTS TABLE
create table if not exists public.challenge_participants (
  id uuid default gen_random_uuid() primary key,
  challenge_id text references public.daily_challenges(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  build_id text references public.user_builds(id) on delete set null,
  score integer not null,
  luck_score integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_challenge_participants_challenge on public.challenge_participants(challenge_id);
create index if not exists idx_challenge_participants_user on public.challenge_participants(user_id);

-- 5. HARDWARE DATASET TABLE
create table if not exists public.hardware (
  id text primary key,
  name text not null,
  brand text not null,
  category text not null check (category in ('cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'cooler', 'case')),
  price integer not null,
  performance integer default 5 not null,
  power integer default 65 not null,
  socket text,
  memory_type text,
  vram integer,
  form_factor text,
  image_url text,
  specs text,
  badge text,
  status text default 'active' check (status in ('active', 'disabled')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_hardware_category on public.hardware(category);
create index if not exists idx_hardware_status on public.hardware(status);
create index if not exists idx_hardware_brand on public.hardware(brand);

-- 6. ADMIN AUDIT LOGS TABLE
create table if not exists public.admin_logs (
  id uuid default gen_random_uuid() primary key,
  admin_id uuid references auth.users(id) on delete set null,
  admin_email text,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  target_resource text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_admin_logs_created_at on public.admin_logs(created_at desc);
create index if not exists idx_admin_logs_admin_id on public.admin_logs(admin_id);

-- 7. MEMBER ACTIVITY LOGS TABLE
create table if not exists public.member_activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_type text not null check (activity_type in ('login', 'random_pc', 'save_build', 'delete_build', 'join_challenge')),
  description text not null,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_member_activities_user on public.member_activities(user_id);
create index if not exists idx_member_activities_type on public.member_activities(activity_type);
create index if not exists idx_member_activities_created_at on public.member_activities(created_at desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ==============================================================================

-- Helper Function: Check if current authenticated user is an Admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid() and status = 'active'),
    false
  );
$$;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_builds enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.hardware enable row level security;
alter table public.admin_logs enable row level security;
alter table public.member_activities enable row level security;

-- ------------------------------------------------------------------------------
-- POLICIES: PROFILES
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own basic profile" on public.profiles;
drop policy if exists "Admins can update any profile" on public.profiles;
drop policy if exists "Admins can delete any profile" on public.profiles;

-- Policy: User can view own profile OR Admin can view all profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Policy: Users can only update their own username/avatar/last_active (cannot change role or status)
create policy "Users can update own basic profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id and
    role = (select role from public.profiles where id = auth.uid()) and
    status = (select status from public.profiles where id = auth.uid())
  );

-- Policy: Admins can update any profile (change role, status, etc.)
create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Policy: Admins can delete any profile
create policy "Admins can delete any profile"
  on public.profiles for delete
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: USER BUILDS
-- ------------------------------------------------------------------------------
drop policy if exists "Users can view own builds" on public.user_builds;
drop policy if exists "Users can insert own builds" on public.user_builds;
drop policy if exists "Users can update own builds" on public.user_builds;
drop policy if exists "Users can delete own builds" on public.user_builds;
drop policy if exists "Users and Admins view builds" on public.user_builds;
drop policy if exists "Users and Admins delete builds" on public.user_builds;

-- View own builds OR Admin view all
create policy "Users and Admins view builds"
  on public.user_builds for select
  using (auth.uid() = user_id or public.is_admin());

-- Insert own build
create policy "Users can insert own builds"
  on public.user_builds for insert
  with check (auth.uid() = user_id);

-- Update own build
create policy "Users can update own builds"
  on public.user_builds for update
  using (auth.uid() = user_id);

-- Delete own build OR Admin delete
create policy "Users and Admins delete builds"
  on public.user_builds for delete
  using (auth.uid() = user_id or public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: HARDWARE
-- ------------------------------------------------------------------------------
drop policy if exists "Anyone can view active hardware" on public.hardware;
drop policy if exists "Admins can manage hardware" on public.hardware;
drop policy if exists "Hardware view policy" on public.hardware;
drop policy if exists "Admins can insert hardware" on public.hardware;
drop policy if exists "Admins can update hardware" on public.hardware;
drop policy if exists "Admins can delete hardware" on public.hardware;

-- Active hardware is visible to all; disabled hardware visible only to admins
create policy "Hardware view policy"
  on public.hardware for select
  using (status = 'active' or public.is_admin());

-- Insert/Update/Delete only for admins
create policy "Admins can insert hardware"
  on public.hardware for insert
  with check (public.is_admin());

create policy "Admins can update hardware"
  on public.hardware for update
  using (public.is_admin());

create policy "Admins can delete hardware"
  on public.hardware for delete
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: DAILY CHALLENGES
-- ------------------------------------------------------------------------------
drop policy if exists "Anyone can view active challenges" on public.daily_challenges;
drop policy if exists "Admins can manage daily challenges" on public.daily_challenges;
drop policy if exists "Challenges view policy" on public.daily_challenges;
drop policy if exists "Admins can insert daily challenges" on public.daily_challenges;
drop policy if exists "Admins can update daily challenges" on public.daily_challenges;
drop policy if exists "Admins can delete daily challenges" on public.daily_challenges;

create policy "Challenges view policy"
  on public.daily_challenges for select
  using (status = 'active' or public.is_admin());

create policy "Admins can insert daily challenges"
  on public.daily_challenges for insert
  with check (public.is_admin());

create policy "Admins can update daily challenges"
  on public.daily_challenges for update
  using (public.is_admin());

create policy "Admins can delete daily challenges"
  on public.daily_challenges for delete
  using (public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: CHALLENGE PARTICIPANTS
-- ------------------------------------------------------------------------------
drop policy if exists "Participants view policy" on public.challenge_participants;
drop policy if exists "Users can insert challenge participation" on public.challenge_participants;

create policy "Participants view policy"
  on public.challenge_participants for select
  using (true);

create policy "Users can insert challenge participation"
  on public.challenge_participants for insert
  with check (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- POLICIES: ADMIN LOGS
-- ------------------------------------------------------------------------------
drop policy if exists "Only admins can view admin logs" on public.admin_logs;
drop policy if exists "Admins can insert admin logs" on public.admin_logs;

create policy "Only admins can view admin logs"
  on public.admin_logs for select
  using (public.is_admin());

create policy "Admins can insert admin logs"
  on public.admin_logs for insert
  with check (public.is_admin());

-- ------------------------------------------------------------------------------
-- POLICIES: MEMBER ACTIVITIES
-- ------------------------------------------------------------------------------
drop policy if exists "Users view own activity and Admins view all" on public.member_activities;
drop policy if exists "Users can insert own activity" on public.member_activities;

create policy "Users view own activity and Admins view all"
  on public.member_activities for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Users can insert own activity"
  on public.member_activities for insert
  with check (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH.USERS INSERT
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    email,
    avatar_url,
    role,
    status,
    created_at,
    updated_at,
    last_active
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    'user',
    'active',
    now(),
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now(),
    last_active = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- SAMPLE INITIAL DAILY CHALLENGE
-- ==============================================================================
insert into public.daily_challenges (
  id,
  title,
  description,
  budget,
  usage,
  target_score,
  start_date,
  end_date,
  status,
  constraints,
  reward_title
)
values (
  'challenge-today',
  'Best Gaming PC Under ฿25,000',
  'จัดคอมเล่นเกมสุดคุ้มในงบไม่เกิน 25,000 บาท ให้ได้คะแนน Performance เกิน 65+ และมี Luck Score สูงสุด!',
  25000,
  'gaming',
  65,
  current_date,
  current_date + interval '7 days',
  'active',
  '{"specialGoal": "รีดเฟรมเรตและประหยัดงบให้คุ้มที่สุด"}'::jsonb,
  'Budget Gaming Conqueror'
)
on conflict (id) do nothing;
