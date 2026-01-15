-- Create project_sprints table
create table if not exists public.project_sprints (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.rei_projects(id) on delete cascade not null,
  title text not null,
  type text not null check (type in ('planning', 'ongoing')),
  status text not null default 'planned' check (status in ('planned', 'active', 'closed')),
  start_date date,
  end_date date,
  goals text[],
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create project_tasks table
create table if not exists public.project_tasks (
  id uuid default gen_random_uuid() primary key,
  sprint_id uuid references public.project_sprints(id) on delete cascade not null,
  project_id uuid references public.rei_projects(id) on delete cascade not null, -- Denormalized for easier querying
  title text not null,
  description text, -- Can be HTML or JSON
  status text not null default 'backlog' check (status in ('backlog', 'todo', 'in_progress', 'review', 'done', 'blocked')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid references auth.users(id),
  tags text[],
  due_date timestamptz,
  position integer default 0, -- For Kanban ordering
  visible_to_client boolean default false, -- Shadow Board Toggle
  magic_link_token text, -- For Magic Loop approvals
  audited_by uuid references auth.users(id),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Create task_comments table (Chat Lateral)
create table if not exists public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.project_tasks(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  content text not null,
  type text default 'chat' check (type in ('chat', 'log')), -- 'log' for audit trail
  created_at timestamptz default now() not null
);

-- Create task_documents table (Linkage to client_documents)
create table if not exists public.task_documents (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.project_tasks(id) on delete cascade not null,
  document_id uuid references public.client_documents(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- RLS Policies
alter table public.project_sprints enable row level security;
alter table public.project_tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_documents enable row level security;

-- Simple RLS: Authenticated users can do everything (for now, can be refined based on roles later)
create policy "Enable all for authenticated users on sprints" on public.project_sprints for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users on tasks" on public.project_tasks for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users on comments" on public.task_comments for all using (auth.role() = 'authenticated');
create policy "Enable all for authenticated users on task_docs" on public.task_documents for all using (auth.role() = 'authenticated');

-- Indexes for performance
create index idx_sprints_project_id on public.project_sprints(project_id);
create index idx_sprints_status on public.project_sprints(status);
create index idx_tasks_sprint_id on public.project_tasks(sprint_id);
create index idx_tasks_project_id on public.project_tasks(project_id);
create index idx_tasks_assignee_id on public.project_tasks(assignee_id);
create index idx_tasks_status on public.project_tasks(status);
create index idx_comments_task_id on public.task_comments(task_id);
