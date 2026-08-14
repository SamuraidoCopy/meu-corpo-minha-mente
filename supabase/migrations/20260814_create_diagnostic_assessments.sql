-- Auditable, versioned result for the guided diagnosis flow.
create table if not exists public.diagnostic_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  facial_zone_ids text[] not null default '{}',
  facial_scores jsonb not null default '{}'::jsonb,
  question_answers jsonb not null default '{}'::jsonb,
  question_scores jsonb not null default '{}'::jsonb,
  tiebreak_answers jsonb not null default '{}'::jsonb,
  tiebreak_scores jsonb not null default '{}'::jsonb,
  result_kind text
    check (result_kind is null or result_kind in ('single', 'combined', 'insufficient')),
  result_elements text[] not null default '{}',
  resolution_method text,
  facial_convergence text
    check (facial_convergence is null or facial_convergence in (
      'no_facial_data', 'convergent', 'partially_convergent', 'divergent'
    )),
  reflection_answers jsonb,
  algorithm_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.profiles
  add column if not exists highlighted_elements text[];

create index if not exists diagnostic_assessments_user_created_idx
  on public.diagnostic_assessments (user_id, created_at desc);

alter table public.diagnostic_assessments enable row level security;

drop policy if exists "Users can view their own diagnostic assessments"
  on public.diagnostic_assessments;
create policy "Users can view their own diagnostic assessments"
  on public.diagnostic_assessments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own diagnostic assessments"
  on public.diagnostic_assessments;
create policy "Users can create their own diagnostic assessments"
  on public.diagnostic_assessments for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own diagnostic assessments"
  on public.diagnostic_assessments;
create policy "Users can update their own diagnostic assessments"
  on public.diagnostic_assessments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep assessment creation and the compatibility profile cache in one
-- transaction. The server action computes p_record; this function only
-- persists that already-validated, versioned record atomically.
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
  result_elements_value text[] := coalesce(
    array(select jsonb_array_elements_text(coalesce(p_record->'result_elements', '[]'::jsonb))),
    '{}'
  );
begin
  if auth.uid() is distinct from p_user_id then
    raise exception 'not authorized';
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
      p_record->>'algorithm_version',
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
        algorithm_version = p_record->>'algorithm_version',
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

revoke all on function public.complete_diagnostic_assessment(uuid, jsonb, uuid) from public;
grant execute on function public.complete_diagnostic_assessment(uuid, jsonb, uuid) to authenticated;
