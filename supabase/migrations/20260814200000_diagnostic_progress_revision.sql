-- Progress saves are snapshots emitted by the browser. A monotonic revision
-- makes a late response from an older request harmless after a newer snapshot
-- has already been accepted.
alter table public.diagnostic_assessments
  add column if not exists progress_revision integer not null default 0;

alter table public.diagnostic_assessments
  drop constraint if exists diagnostic_assessments_progress_revision_check;

alter table public.diagnostic_assessments
  add constraint diagnostic_assessments_progress_revision_check
  check (progress_revision >= 0);

drop function if exists public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb);

create or replace function public.merge_diagnostic_progress(
  p_user_id uuid,
  p_assessment_id uuid,
  p_question_answers jsonb,
  p_tiebreak_answers jsonb,
  p_reflection_answers jsonb,
  p_revision integer
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  updated_id uuid;
  current_status text;
begin
  if p_revision is null or p_revision < 0 then
    raise exception 'invalid progress revision';
  end if;

  update public.diagnostic_assessments
  set question_answers = question_answers || coalesce(p_question_answers, '{}'::jsonb),
      tiebreak_answers = tiebreak_answers || coalesce(p_tiebreak_answers, '{}'::jsonb),
      reflection_answers = coalesce(reflection_answers, '{}'::jsonb) || coalesce(p_reflection_answers, '{}'::jsonb),
      progress_revision = p_revision,
      updated_at = now()
  where id = p_assessment_id
    and user_id = p_user_id
    and status = 'in_progress'
    and p_revision > progress_revision
  returning id into updated_id;

  if updated_id is not null then
    return true;
  end if;

  -- A stale response is a successful no-op. This is also intentionally true
  -- after completion so an in-flight request cannot turn a successful submit
  -- into a user-visible background error.
  select status into current_status
    from public.diagnostic_assessments
   where id = p_assessment_id
     and user_id = p_user_id;

  if current_status in ('in_progress', 'completed') then
    return true;
  end if;

  raise exception 'assessment not found or already completed';
end;
$$;

revoke all on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb, integer)
  to service_role;
