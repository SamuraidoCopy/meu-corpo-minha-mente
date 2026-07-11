-- Leads capturados pelo quiz público "O que domina seu corpo?"
create table if not exists public.quiz_leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text not null,
  element text not null check (element in ('Madeira', 'Fogo', 'Terra', 'Metal', 'Água')),
  answers jsonb not null default '[]'::jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  src text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  consented_at timestamp with time zone not null,
  brevo_synced_at timestamp with time zone,
  result_email_sent_at timestamp with time zone
);

create index if not exists quiz_leads_created_at_idx on public.quiz_leads (created_at desc);
create index if not exists quiz_leads_email_idx on public.quiz_leads (lower(email));
create index if not exists quiz_leads_element_idx on public.quiz_leads (element);
create index if not exists quiz_leads_src_idx on public.quiz_leads (src);

alter table public.quiz_leads enable row level security;

create policy "Admins can read quiz leads" on public.quiz_leads
  for select using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
