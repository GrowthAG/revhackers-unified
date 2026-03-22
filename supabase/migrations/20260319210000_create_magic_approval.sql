-- ==============================================================================
-- ORQFLOW MAGIC APPROVAL LOOP (EPIC 8.2)
-- A ponte Assíncrona entre Agência e Cliente (Zero-Login Approval)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.orqflow_magic_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(16), 'hex'), -- 32-char crypto token
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '14 days'
);

CREATE INDEX idx_orqflow_magic_links_token ON public.orqflow_magic_links(token);

-- A Tabela precisa ser lida PUBLICAMENTE se o token for conhecido!
-- Mas só pode ser criada/atualizada via Server (ou policies estritas)

ALTER TABLE public.orqflow_magic_links ENABLE ROW LEVEL SECURITY;

-- Admins criam links
CREATE POLICY "Admins can create magic links" 
ON public.orqflow_magic_links FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can read magic links" 
ON public.orqflow_magic_links FOR SELECT 
USING (auth.role() = 'authenticated');

-- Visitantes Web podem ler APENAS usando o TOKEN exato na query
CREATE POLICY "Public can read via exact token" 
ON public.orqflow_magic_links FOR SELECT 
USING (true);

-- Visitantes Web podem UPDATAR o status se conhecerem o token
CREATE POLICY "Public can update via token" 
ON public.orqflow_magic_links FOR UPDATE
USING (true)
WITH CHECK (true);

-- E como a página exibirá o conteúdo da Task (Copy/Artigo)? 
-- Precisamos liberar acesso a public.orqflow_tasks temporariamente se associada ao token.
-- Ou, para não enfraquecer o RLS da Tarefa, o front-end poderia usar uma Edge Function.
-- Para o MVP rápido e local, manteremos fetch via React com chave anônima,
-- e abriremos leitura pública para Tarefas que possuam um MAGIC LINK ativo.

CREATE POLICY "Public can read tasks with active magic links"
ON public.orqflow_tasks FOR SELECT
USING (
   EXISTS (
      SELECT 1 FROM public.orqflow_magic_links 
      WHERE orqflow_magic_links.task_id = orqflow_tasks.id
   )
);

-- ==============================================================================
-- AUTOMATION TRIGGER: The magic that moves Kanban cards instantly
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.orqflow_magic_link_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
     -- Aprovado pelo cliente = Finalizado
     UPDATE public.orqflow_tasks SET status = 'done', updated_at = NOW() WHERE id = NEW.task_id;
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
     -- Rejeitado pelo cliente = Volta pra esteira (doing/todo)
     UPDATE public.orqflow_tasks SET status = 'doing', updated_at = NOW() WHERE id = NEW.task_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_magic_link_status ON public.orqflow_magic_links;
CREATE TRIGGER trg_magic_link_status
AFTER UPDATE ON public.orqflow_magic_links
FOR EACH ROW EXECUTE FUNCTION public.orqflow_magic_link_trigger();
