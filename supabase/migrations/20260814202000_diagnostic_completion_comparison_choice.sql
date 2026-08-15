-- Keep the comparison choice in the completed audit row as well as in drafts.
create or replace function public.complete_diagnostic_assessment(
  p_user_id uuid,
  p_record jsonb,
  p_assessment_id uuid default null
) returns uuid
language plpgsql
security invoker
set search_path = ''
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
      user_id, status, facial_zone_ids, facial_scores, question_answers,
      question_scores, tiebreak_answers, tiebreak_scores, result_kind,
      result_elements, resolution_method, facial_convergence, comparison_choice,
      reflection_answers, algorithm_version, completed_at
    ) values (
      p_user_id, 'completed',
      coalesce(array(select jsonb_array_elements_text(coalesce(p_record->'facial_zone_ids', '[]'::jsonb))), '{}'),
      coalesce(p_record->'facial_scores', '{}'::jsonb),
      coalesce(p_record->'question_answers', '{}'::jsonb),
      coalesce(p_record->'question_scores', '{}'::jsonb),
      coalesce(p_record->'tiebreak_answers', '{}'::jsonb),
      coalesce(p_record->'tiebreak_scores', '{}'::jsonb),
      result_kind_value, result_elements_value,
      nullif(p_record->>'resolution_method', ''),
      nullif(p_record->>'facial_convergence', ''),
      nullif(p_record->>'comparison_choice', ''),
      coalesce(p_record->'reflection_answers', '{}'::jsonb),
      algorithm_version_value, now()
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
        comparison_choice = nullif(p_record->>'comparison_choice', ''),
        reflection_answers = coalesce(p_record->'reflection_answers', '{}'::jsonb),
        algorithm_version = algorithm_version_value,
        updated_at = now(), completed_at = now()
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

revoke all on function public.complete_diagnostic_assessment(uuid, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.complete_diagnostic_assessment(uuid, jsonb, uuid)
  to service_role;
