-- Knowledge Libraries Schema Evolution
-- Author: AI Specialist (Backend & IA)

-- 1. Create Knowledge Libraries Table
create table if not exists public.knowledge_libraries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  client_id uuid references public.clients(id) on delete cascade,
  is_global boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Agent-Library Junction Table
create table if not exists public.agent_libraries (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  library_id uuid references public.knowledge_libraries(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(agent_id, library_id)
);

-- 3. Update Agent Documents Table to support Libraries
alter table public.agent_documents 
  alter column agent_id drop not null,
  add column if not exists library_id uuid references public.knowledge_libraries(id) on delete cascade;

-- 4. Enable RLS
alter table public.knowledge_libraries enable row level security;
alter table public.agent_libraries enable row level security;

-- 5. Policies
create policy "Admins can manage libraries" on public.knowledge_libraries
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

create policy "Admins can manage agent_libraries" on public.agent_libraries
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- 6. Updated Match Function
create or replace function match_agent_knowledge (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_agent_id uuid
)
returns table (
  id uuid,
  filename text,
  content text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ad.id,
    ad.filename,
    ad.content,
    1 - (ad.embedding <=> query_embedding) as similarity
  from agent_documents ad
  where 1 - (ad.embedding <=> query_embedding) > match_threshold
  and (
    ad.agent_id = filter_agent_id -- Private documents
    OR ad.library_id IN ( -- Documents from libraries linked to this agent
      select al.library_id 
      from agent_libraries al 
      where al.agent_id = filter_agent_id
    )
  )
  order by ad.embedding <=> query_embedding
  limit match_count;
end;
$$;
