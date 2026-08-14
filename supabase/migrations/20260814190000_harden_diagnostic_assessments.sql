-- Users may read their own assessments, but every mutation crosses the
-- trusted Server Action boundary and executes with the service-role client.
drop policy if exists "Users can create their own diagnostic assessments"
  on public.diagnostic_assessments;
drop policy if exists "Users can update their own diagnostic assessments"
  on public.diagnostic_assessments;

revoke all on table public.diagnostic_assessments from public, anon, authenticated;
grant select on table public.diagnostic_assessments to authenticated;
grant select, insert, update, delete on table public.diagnostic_assessments to service_role;

create or replace function public.complete_diagnostic_assessment(
  p_user_id uuid,
  p_record jsonb,
  p_assessment_id uuid default null
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  assessment_id uuid;
  result_kind_value text := p_record->>'result_kind';
  algorithm_version_value text := nullif(p_record->>'algorithm_version', '');
  result_elements_value text[] := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_record->'result_elements', '[]'::jsonb))),
    '{}'
  );
begin
  if result_kind_value not in ('single', 'combined', 'insufficient') then
    raise exception 'invalid result kind';
  end if;

  if algorithm_version_value is null then
    raise exception 'algorithm version is required';
  end if;

  if p_assessment_id is null then
    insert into public.diagnostic_assessments (
      user_id,
      status,
      facial_zone_ids,
      facial_scores,
      question_answers,
      question_scores,
      tiebreak_answers,
      tiebreak_scores,
      result_kind,
      result_elements,
      resolution_method,
      facial_convergence,
      reflection_answers,
      algorithm_version,
      completed_at
    ) values (
      p_user_id,
      'completed',
      coalesce(array(select jsonb_array_elements_text(coalesce(p_record->'facial_zone_ids', '[]'::jsonb))), '{}'),
      coalesce(p_record->'facial_scores', '{}'::jsonb),
      coalesce(p_record->'question_answers', '{}'::jsonb),
      coalesce(p_record->'question_scores', '{}'::jsonb),
      coalesce(p_record->'tiebreak_answers', '{}'::jsonb),
      coalesce(p_record->'tiebreak_scores', '{}'::jsonb),
      result_kind_value,
      result_elements_value,
      nullif(p_record->>'resolution_method', ''),
      nullif(p_record->>'facial_convergence', ''),
      coalesce(p_record->'reflection_answers', '{}'::jsonb),
      algorithm_version_value,
      now()
    ) returning id into assessment_id;
  else
    update public.diagnostic_assessments
    set status = 'completed',
        facial_zone_ids = coalesce(array(select jsonb_array_elements_text(coalesce(p_record->'facial_zone_ids', '[]'::jsonb))), '{}'),
        facial_scores = coalesce(p_record->'facial_scores', '{}'::jsonb),
        question_answers = coalesce(p_record->'question_answers', '{}'::jsonb),
        question_scores = coalesce(p_record->'question_scores', '{}'::jsonb),
        tiebreak_answers = coalesce(p_record->'tiebreak_answers', '{}'::jsonb),
        tiebreak_scores = coalesce(p_record->'tiebreak_scores', '{}'::jsonb),
        result_kind = result_kind_value,
        result_elements = result_elements_value,
        resolution_method = nullif(p_record->>'resolution_method', ''),
        facial_convergence = nullif(p_record->>'facial_convergence', ''),
        reflection_answers = coalesce(p_record->'reflection_answers', '{}'::jsonb),
        algorithm_version = algorithm_version_value,
        updated_at = now(),
        completed_at = now()
    where id = p_assessment_id
      and user_id = p_user_id
      and status = 'in_progress'
    returning id into assessment_id;

    if assessment_id is null then
      raise exception 'assessment not found or already completed';
    end if;
  end if;

  update public.profiles
  set dominant_element = case
        when result_kind_value = 'single' then result_elements_value[1]
        else null
      end,
      highlighted_elements = result_elements_value,
      reflection_answers = nullif(p_record->'reflection_answers', '{}'::jsonb),
      updated_at = now()
  where id = p_user_id;

  return assessment_id;
end;
$$;

create or replace function public.merge_diagnostic_progress(
  p_user_id uuid,
  p_assessment_id uuid,
  p_question_answers jsonb,
  p_tiebreak_answers jsonb,
  p_reflection_answers jsonb
) returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_id uuid;
begin
  update public.diagnostic_assessments
  set question_answers = question_answers || coalesce(p_question_answers, '{}'::jsonb),
      tiebreak_answers = tiebreak_answers || coalesce(p_tiebreak_answers, '{}'::jsonb),
      reflection_answers = coalesce(reflection_answers, '{}'::jsonb) || coalesce(p_reflection_answers, '{}'::jsonb),
      updated_at = now()
  where id = p_assessment_id
    and user_id = p_user_id
    and status = 'in_progress'
  returning id into updated_id;

  if updated_id is null then
    raise exception 'assessment not found or already completed';
  end if;

  return true;
end;
$$;

revoke all on function public.complete_diagnostic_assessment(uuid, jsonb, uuid)
  from public, anon, authenticated;
revoke all on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.complete_diagnostic_assessment(uuid, jsonb, uuid)
  to service_role;
grant execute on function public.merge_diagnostic_progress(uuid, uuid, jsonb, jsonb, jsonb)
  to service_role;
