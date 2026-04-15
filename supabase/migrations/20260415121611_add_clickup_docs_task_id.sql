-- Migration: 20260415121611_add_clickup_docs_task_id
-- Description: Adiciona o tracking da Task Zero no ClickUp (Central de Documentacao) ao projeto

ALTER TABLE public.rei_projects ADD COLUMN IF NOT EXISTS clickup_docs_task_id text;

COMMENT ON COLUMN public.rei_projects.clickup_docs_task_id IS 'ID logico da Task Zero no ClickUp que armazena o link pro Portal do Cliente. Atualizado via orchestrator assim que a Central eh provisionada.';
