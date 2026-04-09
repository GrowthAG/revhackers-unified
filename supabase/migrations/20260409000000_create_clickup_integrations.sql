-- ==============================================================================
-- CLICKUP INTEGRATIONS
-- Estado canonico da ligacao entre rei_projects e o workspace no ClickUp.
-- Uma linha por projeto. Populada em 2 momentos:
--   1. Pos-kickoff assinado   -> clickup-orchestrator cria folder
--   2. Pos-plano aprovado     -> clickup-sprint-orchestrator cria lists + tasks
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.clickup_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rei_project_id UUID NOT NULL REFERENCES public.rei_projects(id) ON DELETE CASCADE,

    -- Identificadores do ClickUp
    clickup_folder_id TEXT,
    clickup_space_id TEXT,

    -- Mapa de fases do roadmap para lists do ClickUp
    -- Estrutura: [{ phase_name, phase_title, list_id, task_ids: [] }]
    sprint_lists JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Estado do workspace (folder)
    workspace_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (workspace_status IN ('pending', 'ready', 'failed', 'archived')),

    -- Estado das sprints (lists + tasks)
    sprints_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (sprints_status IN ('pending', 'creating', 'ready', 'failed')),

    last_error TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Um projeto pode ter no maximo uma integracao ativa
    CONSTRAINT clickup_integrations_unique_project UNIQUE (rei_project_id)
);

CREATE INDEX IF NOT EXISTS idx_clickup_integrations_project
    ON public.clickup_integrations(rei_project_id);
CREATE INDEX IF NOT EXISTS idx_clickup_integrations_workspace_status
    ON public.clickup_integrations(workspace_status);

-- ==============================================================================
-- Log de execucoes do orchestrator (observabilidade e debug)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.clickup_orchestrator_runs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rei_project_id UUID REFERENCES public.rei_projects(id) ON DELETE CASCADE,

    -- Qual orchestrator gerou o run
    kind TEXT NOT NULL CHECK (kind IN ('workspace_setup', 'sprint_setup')),

    -- Como foi disparado
    triggered_by TEXT NOT NULL
        CHECK (triggered_by IN ('kickoff_signature', 'plan_approval', 'admin_manual', 'retry')),

    status TEXT NOT NULL CHECK (status IN ('in_progress', 'success', 'partial', 'failed', 'skipped')),

    folder_id TEXT,
    list_ids_created TEXT[],
    tasks_created_count INTEGER DEFAULT 0,

    error_message TEXT,
    duration_ms INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clickup_runs_project
    ON public.clickup_orchestrator_runs(rei_project_id);
CREATE INDEX IF NOT EXISTS idx_clickup_runs_status
    ON public.clickup_orchestrator_runs(status);
CREATE INDEX IF NOT EXISTS idx_clickup_runs_created
    ON public.clickup_orchestrator_runs(created_at DESC);

-- ==============================================================================
-- RLS: apenas admin/super_admin leem. Service role escreve via edge function.
-- ==============================================================================

ALTER TABLE public.clickup_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clickup_orchestrator_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read clickup_integrations"
    ON public.clickup_integrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "admins read clickup_orchestrator_runs"
    ON public.clickup_orchestrator_runs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
        )
    );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.touch_clickup_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clickup_integrations_updated_at
    BEFORE UPDATE ON public.clickup_integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_clickup_integrations_updated_at();
