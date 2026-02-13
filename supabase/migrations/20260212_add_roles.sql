-- Add role column to profiles table
alter table profiles 
add column if not exists role text default 'user';

-- Create policy for admins
create policy "Admins can view all profiles." on profiles
  for select using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

create policy "Admins can view all diary entries." on diary_entries
  for select using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );
