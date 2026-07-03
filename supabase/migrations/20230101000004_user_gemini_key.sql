-- ---------------------------------------------------------------------------
-- User Gemini API key: allows signed-in users to bring their own key for
-- unlimited chatbot usage. Without a key they are limited to 3 prompts/day
-- using the app's shared key.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists gemini_api_key text;

-- RLS update: allow users to update their own row with the new column.
-- (The existing "profiles_update_own" policy already covers this since
--  it uses "using (auth.uid() = id)" without column restrictions.)
