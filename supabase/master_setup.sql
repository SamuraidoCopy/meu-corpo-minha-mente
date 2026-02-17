-- ==========================================================
-- MASTER SQL SCRIPT - MEU CORPO MINHA MENTE
-- Cole este script no SQL Editor do Supabase para configurar tudo de uma vez.
-- ==========================================================

-- 1. Tabela de Perfis
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  age int,
  history text,
  onboarding_completed boolean default false,
  dominant_element text,
  role text default 'user'
);

-- RLS para Perfis
alter table profiles enable row level security;

-- Políticas de Acesso (Perfis)
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles." on profiles for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- 2. Tabela do Diário
create table if not exists diary_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  entry_date date not null default current_date,
  energy_level int check (energy_level between 1 and 5),
  sleep_quality int check (sleep_quality between 1 and 5),
  mood text,
  symptoms text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, entry_date)
);

-- RLS para Diário
alter table diary_entries enable row level security;

-- Políticas de Acesso (Diário)
create policy "Users can view own diary entries." on diary_entries for select using (auth.uid() = user_id);
create policy "Users can insert own diary entries." on diary_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own diary entries." on diary_entries for update using (auth.uid() = user_id);
create policy "Admins can view all diary entries." on diary_entries for select using (
  (select role from profiles where id = auth.uid()) = 'admin'
);

-- 3. Automação: Criar Perfil ao Cadastrar Usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger (remove se já existir para não dar erro)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
