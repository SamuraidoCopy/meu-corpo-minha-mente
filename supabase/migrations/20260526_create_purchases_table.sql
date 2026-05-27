-- Create purchases table for managing deferred access
create table if not exists public.purchases (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  full_name text,
  hotmart_transaction_code text,
  purchase_date timestamp with time zone default timezone('utc'::text, now()) not null,
  access_granted boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.purchases enable row level security;

-- Policies
create policy "Admins can manage purchases" on public.purchases
  for all using (
    (select role from public.profiles where id = auth.uid()) = 'admin'
  );
