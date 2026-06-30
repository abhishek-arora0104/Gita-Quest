-- ---------------------------------------------------------------------------
-- Chatbot history: optional signed-in user conversation storage.
--
-- Anonymous users keep chat state client-side only. Signed-in users can store
-- their own chat turns for future personalization/history.
-- ---------------------------------------------------------------------------

create table if not exists public.user_chat_messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  locale      text not null default 'en' check (locale in ('en', 'hi', 'hinglish')),
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  sources     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_chat_messages_user
  on public.user_chat_messages (user_id, created_at desc);

alter table public.user_chat_messages enable row level security;

create policy "chat_messages_select_own" on public.user_chat_messages
  for select using (auth.uid() = user_id);

create policy "chat_messages_insert_own" on public.user_chat_messages
  for insert with check (auth.uid() = user_id);
