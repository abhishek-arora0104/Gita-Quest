-- ==========================================================================
-- Gita Quest — initial schema
-- Tables: profiles, user_chapter_progress, user_quiz_attempts,
--         user_xp_log, user_badges
-- All user tables are protected with Row Level Security (owner-only).
-- ==========================================================================

-- Required for the crypto/gen_random_uuid used in defaults.
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created automatically on signup.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  username           text,
  total_xp           integer not null default 0,
  current_level      integer not null default 1,
  current_streak     integer not null default 0,
  longest_streak     integer not null default 0,
  last_active_date   date,
  daily_login_claimed date,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- user_chapter_progress: per-chapter completion state.
-- ---------------------------------------------------------------------------
create table if not exists public.user_chapter_progress (
  user_id          uuid not null references auth.users (id) on delete cascade,
  chapter_number   integer not null check (chapter_number between 1 and 18),
  summary_read     boolean not null default false,
  reflection_saved text,
  quiz_completed   boolean not null default false,
  best_score       integer not null default 0,
  attempts         integer not null default 0,
  last_attempt_at  timestamptz,
  chapter_completed boolean not null default false,
  completed_at     timestamptz,
  updated_at       timestamptz not null default now(),
  primary key (user_id, chapter_number)
);

-- ---------------------------------------------------------------------------
-- user_quiz_attempts: every quiz attempt, for stats and history.
-- ---------------------------------------------------------------------------
create table if not exists public.user_quiz_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  chapter_number integer not null check (chapter_number between 1 and 18),
  answers        jsonb not null default '{}'::jsonb,
  score          integer not null,
  total          integer not null,
  completed_at   timestamptz not null default now()
);

create index if not exists idx_quiz_attempts_user
  on public.user_quiz_attempts (user_id, completed_at desc);

-- ---------------------------------------------------------------------------
-- user_xp_log: append-only ledger of every XP award.
-- ---------------------------------------------------------------------------
create table if not exists public.user_xp_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  amount        integer not null,
  reason        text not null,
  chapter_number integer,
  created_at    timestamptz not null default now()
);

create index if not exists idx_xp_log_user
  on public.user_xp_log (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- user_badges: which badges a user has earned.
-- ---------------------------------------------------------------------------
create table if not exists public.user_badges (
  user_id   uuid not null references auth.users (id) on delete cascade,
  badge_id  text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

-- ==========================================================================
-- Auto-create a profile row whenever a new auth user is inserted.
-- ==========================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================================================
-- Row Level Security
-- ==========================================================================
alter table public.profiles enable row level security;
alter table public.user_chapter_progress enable row level security;
alter table public.user_quiz_attempts enable row level security;
alter table public.user_xp_log enable row level security;
alter table public.user_badges enable row level security;

-- profiles: a user can read & update only their own row.
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- user_chapter_progress
create policy "progress_select_own" on public.user_chapter_progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.user_chapter_progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.user_chapter_progress
  for update using (auth.uid() = user_id);

-- user_quiz_attempts
create policy "attempts_select_own" on public.user_quiz_attempts
  for select using (auth.uid() = user_id);
create policy "attempts_insert_own" on public.user_quiz_attempts
  for insert with check (auth.uid() = user_id);

-- user_xp_log (read & write own)
create policy "xp_select_own" on public.user_xp_log
  for select using (auth.uid() = user_id);
create policy "xp_insert_own" on public.user_xp_log
  for insert with check (auth.uid() = user_id);

-- user_badges
create policy "badges_select_own" on public.user_badges
  for select using (auth.uid() = user_id);
create policy "badges_insert_own" on public.user_badges
  for insert with check (auth.uid() = user_id);

-- ==========================================================================
-- Helpful updated_at trigger
-- ==========================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists progress_touch on public.user_chapter_progress;
create trigger progress_touch before update on public.user_chapter_progress
  for each row execute function public.touch_updated_at();
