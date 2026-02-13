-- Add dominant_element column to profiles table
alter table profiles 
add column if not exists dominant_element text;
