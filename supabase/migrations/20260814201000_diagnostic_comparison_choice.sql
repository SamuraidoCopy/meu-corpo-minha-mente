-- Keep the final contextual choice in an in-progress draft so a resumed
-- reading does not ask the same comparison question again.
alter table public.diagnostic_assessments
  add column if not exists comparison_choice text;

alter table public.diagnostic_assessments
  drop constraint if exists diagnostic_assessments_comparison_choice_check;

alter table public.diagnostic_assessments
  add constraint diagnostic_assessments_comparison_choice_check
  check (comparison_choice is null or comparison_choice in ('none', 'Madeira', 'Fogo', 'Terra', 'Metal', 'Água'));

drop function if exists public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb, integer);

create or replace function public.merge_diagnostic_progress(
  p_user_id uuid,
  p_assessment_id uuid,
  p_question_answers jsonb,
  p_tiebreak_answers jsonb,
  p_reflection_answers jsonb,
  p_revision integer,
  p_comparison_choice text default null
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

  if p_comparison_choice is not null
     and p_comparison_choice not in ('none', 'Madeira', 'Fogo', 'Terra', 'Metal', 'Água') then
    raise exception 'invalid comparison choice';
  end if;

  update public.diagnostic_assessments
  set question_answers = question_answers || coalesce(p_question_answers, '{}'::jsonb),
      tiebreak_answers = tiebreak_answers || coalesce(p_tiebreak_answers, '{}'::jsonb),
      reflection_answers = coalesce(reflection_answers, '{}'::jsonb) || coalesce(p_reflection_answers, '{}'::jsonb),
      comparison_choice = coalesce(p_comparison_choice, comparison_choice),
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

  -- Older or duplicate snapshots are successful no-ops. A request that was
  -- already in flight when completion ran must not surface a false failure.
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

revoke all on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb, integer, text)
  from public, anon, authenticated;
grant execute on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb, integer, text)
  to service_role;
