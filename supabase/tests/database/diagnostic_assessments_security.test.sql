begin;
select plan(20);

select ok(
  to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)') is not null,
  'completion RPC exists after hardening migration'
);
select ok(
  to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer,text)') is not null,
  'progress merge RPC exists after hardening migration'
);
select ok(
  has_column('public', 'diagnostic_assessments', 'progress_revision'),
  'diagnostic assessments track progress revisions'
);
select ok(
  has_column('public', 'diagnostic_assessments', 'comparison_choice'),
  'diagnostic assessments track comparison choices'
);
select ok(
  to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)') is null
    and to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer)') is null,
  'legacy progress merge RPC signature is removed'
);

select ok(
  not has_table_privilege('anon', 'public.diagnostic_assessments', 'INSERT'),
  'anon cannot insert diagnostic assessments'
);
select ok(
  not has_table_privilege('anon', 'public.diagnostic_assessments', 'UPDATE'),
  'anon cannot update diagnostic assessments'
);
select ok(
  not has_table_privilege('anon', 'public.diagnostic_assessments', 'DELETE'),
  'anon cannot delete diagnostic assessments'
);
select ok(
  not has_table_privilege('authenticated', 'public.diagnostic_assessments', 'INSERT'),
  'authenticated cannot insert diagnostic assessments'
);
select ok(
  not has_table_privilege('authenticated', 'public.diagnostic_assessments', 'UPDATE'),
  'authenticated cannot update diagnostic assessments'
);
select ok(
  not has_table_privilege('authenticated', 'public.diagnostic_assessments', 'DELETE'),
  'authenticated cannot delete diagnostic assessments'
);
select ok(
  has_table_privilege('service_role', 'public.diagnostic_assessments', 'INSERT'),
  'service role can insert diagnostic assessments'
);
select ok(
  has_table_privilege('service_role', 'public.diagnostic_assessments', 'UPDATE'),
  'service role can update diagnostic assessments'
);
select ok(
  case
    when to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)') is null then false
    else not has_function_privilege(
      'anon',
      to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)'),
      'EXECUTE'
    )
  end,
  'anon cannot execute completion RPC'
);
select ok(
  case
    when to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)') is null then false
    else not has_function_privilege(
      'authenticated',
      to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)'),
      'EXECUTE'
    )
  end,
  'authenticated cannot execute completion RPC'
);
select ok(
  case
    when to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)') is null then false
    else has_function_privilege(
      'service_role',
      to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)'),
      'EXECUTE'
    )
  end,
  'service role can execute completion RPC'
);
select ok(
  case
    when to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer,text)') is null then false
    else not has_function_privilege(
      'anon',
      to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer,text)'),
      'EXECUTE'
    )
  end,
  'anon cannot execute progress RPC'
);
select ok(
  case
    when to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer,text)') is null then false
    else not has_function_privilege(
      'authenticated',
      to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer,text)'),
      'EXECUTE'
    )
  end,
  'authenticated cannot execute progress RPC'
);
select ok(
  case
    when to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer,text)') is null then false
    else has_function_privilege(
      'service_role',
      to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb,integer,text)'),
      'EXECUTE'
    )
  end,
  'service role can execute progress RPC'
);

select lives_ok($test$
do $body$
declare
  test_user uuid := gen_random_uuid();
  other_user uuid := gen_random_uuid();
  assessment_id uuid := gen_random_uuid();
  stored_answers jsonb;
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    '00000000-0000-0000-0000-000000000000', test_user, 'authenticated', 'authenticated',
    test_user || '@example.test', 'not-used', now(), '{}'::jsonb, '{}'::jsonb, now(), now()
  );

  insert into public.diagnostic_assessments (id, user_id, status, algorithm_version)
  values (assessment_id, test_user, 'in_progress', 'test');

  perform public.merge_diagnostic_progress(
    test_user, assessment_id, '{"fogo_1": true}'::jsonb, '{}'::jsonb, '{}'::jsonb, 1, null
  );
  perform public.merge_diagnostic_progress(
    test_user, assessment_id, '{"terra_1": true}'::jsonb, '{}'::jsonb, '{}'::jsonb, 2, 'none'
  );

  -- Older and duplicate revisions must not overwrite the accepted snapshot.
  perform public.merge_diagnostic_progress(
    test_user, assessment_id, '{"fogo_1": false}'::jsonb, '{}'::jsonb, '{}'::jsonb, 1, null
  );
  perform public.merge_diagnostic_progress(
    test_user, assessment_id, '{"madeira_1": true}'::jsonb, '{}'::jsonb, '{}'::jsonb, 2, null
  );

  select question_answers into stored_answers
    from public.diagnostic_assessments where id = assessment_id;
  if stored_answers <> '{"fogo_1": true, "terra_1": true}'::jsonb
     or (select comparison_choice from public.diagnostic_assessments where id = assessment_id) <> 'none' then
    raise exception 'stale or duplicate revision changed the accepted snapshot: %', stored_answers;
  end if;

  begin
    perform public.merge_diagnostic_progress(
      other_user, assessment_id, '{"metal_1": true}'::jsonb, '{}'::jsonb, '{}'::jsonb, 3, null
    );
    raise exception 'cross-user merge unexpectedly succeeded';
  exception when others then
    if SQLERRM = 'cross-user merge unexpectedly succeeded' then raise; end if;
  end;

  update public.diagnostic_assessments set status = 'completed' where id = assessment_id;
  perform public.merge_diagnostic_progress(
    test_user, assessment_id, '{"metal_1": true}'::jsonb, '{}'::jsonb, '{}'::jsonb, 4, null
  );
  select question_answers into stored_answers
    from public.diagnostic_assessments where id = assessment_id;
  if stored_answers <> '{"fogo_1": true, "terra_1": true}'::jsonb then
    raise exception 'completed assessment was changed: %', stored_answers;
  end if;
end;
$body$;
$test$, 'progress revisions are monotonic, owner-bound, and completion-safe');

select * from finish();
rollback;
