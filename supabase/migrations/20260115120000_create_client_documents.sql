create table if not exists public.client_documents (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.rei_projects(id) on delete cascade not null,
  document_type text not null, -- 'strategic_plan', 'results_report'
  version integer not null default 1,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft', -- 'draft', 'published', 'archived'
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS
alter table public.client_documents enable row level security;

-- Policies (same pattern as rei_projects for now)
create policy "Enable all operations for authenticated users" 
on public.client_documents 
for all 
using (auth.role() = 'authenticated');

-- Indexes
create index client_documents_project_id_idx on public.client_documents(project_id);
create index client_documents_type_idx on public.client_documents(document_type);
