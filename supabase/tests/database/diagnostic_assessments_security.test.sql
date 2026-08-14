begin;
select plan(8);

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
  not has_function_privilege(
    'authenticated',
    'public.complete_diagnostic_assessment(uuid,jsonb,uuid)',
    'EXECUTE'
  ),
  'authenticated cannot execute completion RPC'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.complete_diagnostic_assessment(uuid,jsonb,uuid)',
    'EXECUTE'
  ),
  'service role can execute completion RPC'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ),
  'authenticated cannot execute progress RPC'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.merge_diagnostic_progress(uuid,uuid,jsonb,jsonb,jsonb)',
    'EXECUTE'
  ),
  'service role can execute progress RPC'
);

select * from finish();
rollback;
