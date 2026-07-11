alter table public.quiz_leads
  add column if not exists submission_id uuid;

update public.quiz_leads
set submission_id = gen_random_uuid()
where submission_id is null;

alter table public.quiz_leads
  alter column submission_id set not null;

create unique index if not exists quiz_leads_submission_id_uidx
  on public.quiz_leads (submission_id);

create table if not exists public.quiz_rate_limits (
  rate_key text primary key,
  scope text not null check (scope in ('ip', 'email')),
  request_count integer not null check (request_count > 0),
  window_started_at timestamp with time zone not null,
  expires_at timestamp with time zone not null
);

create index if not exists quiz_rate_limits_expires_at_idx
  on public.quiz_rate_limits (expires_at);

alter table public.quiz_rate_limits enable row level security;

revoke all on table public.quiz_rate_limits from public, anon, authenticated;

create or replace function public.check_quiz_submission_rate_limit(
  p_ip_key text,
  p_email_key text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamp with time zone := pg_catalog.clock_timestamp();
  v_ip_count integer;
  v_email_count integer;
begin
  if p_ip_key is null or p_ip_key = '' or p_email_key is null or p_email_key = '' then
    return false;
  end if;

  insert into public.quiz_rate_limits as limits (
    rate_key,
    scope,
    request_count,
    window_started_at,
    expires_at
  )
  values (p_ip_key, 'ip', 1, v_now, v_now + interval '10 minutes')
  on conflict (rate_key) do update
  set scope = 'ip',
      request_count = case
        when limits.expires_at <= v_now then 1
        else limits.request_count + 1
      end,
      window_started_at = case
        when limits.expires_at <= v_now then v_now
        else limits.window_started_at
      end,
      expires_at = case
        when limits.expires_at <= v_now then v_now + interval '10 minutes'
        else limits.expires_at
      end
  returning request_count into v_ip_count;

  insert into public.quiz_rate_limits as limits (
    rate_key,
    scope,
    request_count,
    window_started_at,
    expires_at
  )
  values (p_email_key, 'email', 1, v_now, v_now + interval '10 minutes')
  on conflict (rate_key) do update
  set scope = 'email',
      request_count = case
        when limits.expires_at <= v_now then 1
        else limits.request_count + 1
      end,
      window_started_at = case
        when limits.expires_at <= v_now then v_now
        else limits.window_started_at
      end,
      expires_at = case
        when limits.expires_at <= v_now then v_now + interval '10 minutes'
        else limits.expires_at
      end
  returning request_count into v_email_count;

  if pg_catalog.random() < 0.01 then
    delete from public.quiz_rate_limits
    where ctid in (
      select expired.ctid
      from public.quiz_rate_limits as expired
      where expired.expires_at <= v_now
      order by expired.expires_at
      limit 100
    )
    and expires_at <= v_now;
  end if;

  return v_ip_count <= 10 and v_email_count <= 3;
end;
$$;

revoke execute on function public.check_quiz_submission_rate_limit(text, text)
  from public, anon, authenticated;
grant execute on function public.check_quiz_submission_rate_limit(text, text)
  to service_role;
