-- ==============================================================================
-- ORQFLOW EPIC 5: CLIENT ABRAP VIEW & RLS GRANULAR
-- View segura que ofusca (Data Masking) campos internos do motor da Agência
-- ==============================================================================

-- 1. Cria ou substitui a View de Leitura para o Cliente Final
CREATE OR REPLACE VIEW public.vw_orqflow_public_tasks AS
SELECT 
    id,
    project_id,
    sprint_id,
    title,
    status,
    due_date,
    created_at
    -- NOTA DO ENGENHEIRO: Colunas operacionais (estimated_hours, assignee_id, blocks, etc)
    -- JAMAIS devem cruzar esta view. Elas morrem no servidor.
FROM public.orqflow_tasks
WHERE status != 'archived';

-- 2. Conceder permissão de leitura explícita no endpoint anônimo (Zero-Login do Cliente)
GRANT SELECT ON public.vw_orqflow_public_tasks TO anon;
GRANT SELECT ON public.vw_orqflow_public_tasks TO authenticated;
GRANT SELECT ON public.vw_orqflow_public_tasks TO service_role;

-- 3. A mesma lógica para a Sprints (O cliente precisa ver a qual Sprint a tarefa pertence)
CREATE OR REPLACE VIEW public.vw_orqflow_public_sprints AS
SELECT 
    id,
    project_id,
    name,
    status,
    start_date,
    end_date
FROM public.orqflow_sprints;

GRANT SELECT ON public.vw_orqflow_public_sprints TO anon;
GRANT SELECT ON public.vw_orqflow_public_sprints TO authenticated;
GRANT SELECT ON public.vw_orqflow_public_sprints TO service_role;
