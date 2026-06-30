-- ---------------------------------------------------------------------------
-- Quiz enhancements: track whether an attempt was timed and how long it took.
--
-- Both columns are additive and backwards-compatible:
--   - mode defaults to 'standard', so all pre-existing attempts are treated
--     as standard (untimed) runs.
--   - duration_ms is nullable; only timed attempts (and future runs that
--     report timing) populate it.
-- ---------------------------------------------------------------------------

alter table public.user_quiz_attempts
  add column if not exists mode text not null default 'standard'
    check (mode in ('standard', 'timed')),
  add column if not exists duration_ms integer;
