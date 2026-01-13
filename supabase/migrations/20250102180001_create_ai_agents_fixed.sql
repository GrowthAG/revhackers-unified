-- Enable pgvector extension for RAG
create extension if not exists vector with schema public;

-- Create Agents table
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null, -- e.g. "Senior Copywriter", "Financial Analyst"
  description text,
  system_prompt text not null,
  avatar_url text,
  model text not null default 'gpt-4o', -- 'gpt-4o', 'claude-sonnet-4-5', etc.
  is_public boolean default false, -- if true, visible to all clients
  client_id uuid references public.clients(id) on delete cascade, -- if set, specific to a client
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Chat Sessions table
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id uuid references public.agents(id) on delete set null,
  title text default 'Nova Conversa',
  context_type text default 'general', -- 'general', 'article', 'material', 'project'
  context_id uuid, -- ID of the article/material/project context
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

- [x] Refactor Edge Function to use `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS)
- [x] Fix UI conditional rendering for staged files
- [x] Fix `KnowledgeUploader` to accept `.pdf` extension
- [/] Debug file selection and processing logic
    - [ ] Add diagnostic logs for `files` state
    - [ ] Research/Implement PDF text extraction
- [ ] Verify persistence after page reload
- [ ] Test RAG chat functionality

-- Create Chat Messages table
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Agent Documents table for RAG (Knowledge Base)
create table if not exists public.agent_documents (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references public.agents(id) on delete cascade not null,
  filename text not null,
  content text not null, -- text content chunk
  metadata jsonb default '{}'::jsonb, -- extra metadata like page number
  embedding vector(1536), -- OpenAI text-embedding-3-small dimension
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.agents enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.agent_documents enable row level security;

-- Policies for Agents (FIXED: using profiles.role instead of user_roles)
-- Public agents are viewable by everyone authenticated
create policy "Public agents are viewable by everyone" on public.agents
  for select using (
    is_public = true 
    OR exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Admins can do everything on agents  
create policy "Admins can do everything on agents" on public.agents
  for all using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Policies for Chat Sessions
create policy "Users can crud their own sessions" on public.chat_sessions
  for all using (auth.uid() = user_id);

-- Policies for Chat Messages
create policy "Users can crud their own messages" on public.chat_messages
  for all using (
    exists (
      select 1 from public.chat_sessions
      where id = chat_messages.session_id and user_id = auth.uid()
    )
  );

-- Policies for Agent Documents
create policy "Admins can manage documents" on public.agent_documents
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- Function to match documents
create or replace function match_agent_documents (
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
    agent_documents.id,
    agent_documents.filename,
    agent_documents.content,
    1 - (agent_documents.embedding <=> query_embedding) as similarity
  from agent_documents
  where 1 - (agent_documents.embedding <=> query_embedding) > match_threshold
  and agent_documents.agent_id = filter_agent_id
  order by agent_documents.embedding <=> query_embedding
  limit match_count;
end;
$$;
