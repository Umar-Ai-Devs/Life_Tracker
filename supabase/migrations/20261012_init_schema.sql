-- ==============================================================================
-- PERSONAL TASK MANAGEMENT SYSTEM
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Migrations
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  timezone text default 'UTC',
  work_start_time time default '09:00:00',
  work_end_time time default '18:00:00',
  theme text default 'dark' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. CATEGORIES TABLE
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#3b82f6',
  icon text default 'Folder',
  created_at timestamptz default now() not null
);

-- 3. TASKS TABLE
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  estimated_duration integer not null default 30, -- In minutes
  planned_date date,                              -- E.g. 2026-10-12
  start_time time,                                -- E.g. 14:00:00
  deadline timestamptz,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium' not null,
  category_id uuid references public.categories(id) on delete set null,
  status text check (status in ('inbox', 'todo', 'in_progress', 'completed', 'cancelled')) default 'inbox' not null,
  actual_duration integer default 0 not null,    -- In seconds
  completed_at timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 4. TIME ENTRIES TABLE
create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  start_time timestamptz not null default now(),
  end_time timestamptz,                          -- Null while actively running
  duration integer,                              -- Recorded seconds for this session
  notes text,
  created_at timestamptz default now() not null
);

-- Enforce maximum of ONE active timer per user at any time
create unique index if not exists unique_active_timer_per_user 
  on public.time_entries (user_id) 
  where end_time is null;

-- Indexes for performance
create index if not exists idx_tasks_user_status on public.tasks(user_id, status);
create index if not exists idx_tasks_user_date on public.tasks(user_id, planned_date);
create index if not exists idx_time_entries_task on public.time_entries(task_id);
create index if not exists idx_time_entries_user on public.time_entries(user_id);
create index if not exists idx_categories_user on public.categories(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.time_entries enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Categories policies
create policy "Users can view their own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert their own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete their own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

-- Tasks policies
create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Time Entries policies
create policy "Users can view their own time entries"
  on public.time_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own time entries"
  on public.time_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own time entries"
  on public.time_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own time entries"
  on public.time_entries for delete
  using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON SIGNUP
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  
  -- Insert default starter categories for new user
  insert into public.categories (user_id, name, color, icon) values
    (new.id, 'Work', '#3b82f6', 'Briefcase'),
    (new.id, 'Personal', '#10b981', 'User'),
    (new.id, 'Study', '#8b5cf6', 'BookOpen'),
    (new.id, 'Health', '#f43f5e', 'Heart');

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger to update updated_at timestamp on task modification
create or replace function public.set_current_timestamp_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_current_timestamp_updated_at();
