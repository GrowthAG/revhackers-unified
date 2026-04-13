-- Hub de Mensagens Internas RevHackers
-- Canais fixos + canais por projeto + DMs entre membros do time

CREATE TABLE IF NOT EXISTS public.hub_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('channel', 'direct', 'project')),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  project_id UUID REFERENCES public.rei_projects(id) ON DELETE CASCADE,
  is_system BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hub_conversation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.hub_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.hub_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.hub_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_name TEXT,
  content TEXT NOT NULL,
  is_system_event BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hub_message_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.hub_messages(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task', 'document', 'opportunity', 'user')),
  entity_id TEXT NOT NULL,
  entity_label TEXT
);

-- Canais fixos do sistema
INSERT INTO public.hub_conversations (type, name, slug, description, is_system)
VALUES
  ('channel', 'Geral', 'geral', 'Comunicacao geral do time', true),
  ('channel', 'Vendas', 'vendas', 'Pipeline, oportunidades e deals', true),
  ('channel', 'Operacoes', 'operacoes', 'Tarefas internas e processos', true)
ON CONFLICT (slug) DO NOTHING;

-- RLS
ALTER TABLE public.hub_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_message_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_users_hub_conversations" ON public.hub_conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_users_hub_members" ON public.hub_conversation_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_users_hub_messages" ON public.hub_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_users_hub_refs" ON public.hub_message_references FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indices
CREATE INDEX IF NOT EXISTS idx_hub_messages_conversation ON public.hub_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_members_user ON public.hub_conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_conversations_project ON public.hub_conversations(project_id);
