-- ==========================================================
-- FIX: RECURSÃO INFINITA NAS POLÍTICAS (RLS)
-- Cole este script no SQL Editor do Supabase e execute.
-- ==========================================================

-- 1. Criar uma função para checar se é admin sem disparar o RLS recursivamente
-- O segredo é o 'security definer', que roda com privilégios de sistema.
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Limpar as políticas problemáticas atuais
drop policy if exists "Admins can view all profiles." on profiles;
drop policy if exists "Admins can view all diary entries." on diary_entries;

-- 3. Recriar com a nova função (sem recursão)
create policy "Admins can view all profiles." on profiles
  for select using (public.is_admin());

create policy "Admins can view all diary entries." on diary_entries
  for select using (public.is_admin());

-- 4. Garantir que a política de INSERT/UPDATE não tenha problemas
-- (O erro de recursão no Select as vezes trava o Upsert que checa existência)
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- NOTA: Se o erro persistir no Select, podemos simplificar ainda mais.
