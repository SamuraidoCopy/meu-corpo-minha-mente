-- Add reflection_answers column to profiles table for the deep reflection phase
alter table profiles 
add column if not exists reflection_answers jsonb;
