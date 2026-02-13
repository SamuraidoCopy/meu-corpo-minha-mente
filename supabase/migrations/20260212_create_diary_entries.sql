-- Create diary_entries table
create table diary_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  entry_date date not null default current_date,
  
  -- Metrics (1-5 scale)
  energy_level int check (energy_level between 1 and 5),
  sleep_quality int check (sleep_quality between 1 and 5),
  mood text, -- e.g., 'Ansiada', 'Triste', 'Neutra', 'Feliz', 'Irritada'
  
  -- Text fields
  symptoms text, -- Open text for specific symptoms
  notes text,    -- General notes
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure one entry per day per user
  unique(user_id, entry_date)
);

-- RLS
alter table diary_entries enable row level security;

create policy "Users can view own diary entries." on diary_entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own diary entries." on diary_entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own diary entries." on diary_entries
  for update using (auth.uid() = user_id);
