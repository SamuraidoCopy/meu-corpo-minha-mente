begin;
select plan(12);

select ok(
  to_regprocedure('public.complete_diagnostic_assessment(uuid,jsonb,uuid)') is not null,
  'completion RPC exists after hardening migration'
);
select ok(
  to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)') is not null,
  'progress merge RPC exists after hardening migration'
);

select ok(
  not has_table_privilege('anon', 'public.diagnostic_assessments', 'INSERT'),
  'anon cannot insert diagnostic assessments'
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
    when to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)') is null then false
    else not has_function_privilege(
      'anon',
      to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)'),
      'EXECUTE'
    )
  end,
  'anon cannot execute progress RPC'
);
select ok(
  case
    when to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)') is null then false
    else not has_function_privilege(
      'authenticated',
      to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)'),
      'EXECUTE'
    )
  end,
  'authenticated cannot execute progress RPC'
);
select ok(
  case
    when to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)') is null then false
    else has_function_privilege(
      'service_role',
      to_regprocedure('public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)'),
      'EXECUTE'
    )
  end,
  'service role can execute progress RPC'
);

select * from finish();
rollback;
