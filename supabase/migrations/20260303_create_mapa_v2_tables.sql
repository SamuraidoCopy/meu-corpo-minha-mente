-- ==========================================================
-- MAPA DA RAIZ V2 - EXPRESSÕES E REFLEXÕES
-- Execute este script no SQL Editor do Supabase
-- ==========================================================

-- 1. Tabela de Expressões Faciais
create table if not exists facial_expressions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  marks_selected jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para Expressões Faciais
alter table facial_expressions enable row level security;

-- Políticas de Acesso
create policy "Users can view own facial expressions." on facial_expressions for select using (auth.uid() = user_id);
create policy "Users can insert own facial expressions." on facial_expressions for insert with check (auth.uid() = user_id);
create policy "Users can update own facial expressions." on facial_expressions for update using (auth.uid() = user_id);

-- 2. Tabela de Reflexões Profundas (Deep Questions)
create table if not exists deep_reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  element_context text not null,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS para Reflexões Profundas
alter table deep_reflections enable row level security;

-- Políticas de Acesso
create policy "Users can view own deep reflections." on deep_reflections for select using (auth.uid() = user_id);
create policy "Users can insert own deep reflections." on deep_reflections for insert with check (auth.uid() = user_id);
create policy "Users can update own deep reflections." on deep_reflections for update using (auth.uid() = user_id);
