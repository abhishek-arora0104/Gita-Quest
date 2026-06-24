-- ==========================================================================
-- Migration 0002: Add trigger to automatically maintain total_xp
-- ==========================================================================

create or replace function public.update_profile_total_xp()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_total_xp integer;
  target_user_id uuid;
begin
  if tg_op = 'DELETE' then
    target_user_id := old.user_id;
  else
    target_user_id := new.user_id;
  end if;

  select coalesce(sum(amount), 0) into new_total_xp
  from public.user_xp_log
  where user_id = target_user_id;

  update public.profiles
  set total_xp = new_total_xp
  where id = target_user_id;

  return null;
end;
$$;

drop trigger if exists on_xp_log_inserted on public.user_xp_log;
create trigger on_xp_log_inserted
  after insert or update or delete on public.user_xp_log
  for each row execute function public.update_profile_total_xp();
