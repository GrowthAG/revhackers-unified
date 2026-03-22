-- ==============================================================================
-- ORQFLOW EPIC 4 & EPIC 6: CUSTOM FIELDS & DEPENDENCIES
-- O motor de Relacionamento N:N e o Bloqueador de Tarefas
-- ==============================================================================

-- 1. Tabela-Mãe de Definição de Campos Personalizados (Workspace Level)
CREATE TABLE IF NOT EXISTS public.orqflow_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Ex: "Custo de Ads", "Aprovação Necessária", "Tag"
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'currency', 'dropdown', 'date', 'boolean')),
    options JSONB, -- Array de opções se for dropdown
    is_private BOOLEAN DEFAULT false, -- SE TRUE, O CLIENTE FINAL NUNCA PODE VER ESSE CAMPO! (Muralha RLS)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela Filha de Valores (A intersecção Task x Field)
CREATE TABLE IF NOT EXISTS public.orqflow_task_custom_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.orqflow_custom_fields(id) ON DELETE CASCADE,
    value JSONB NOT NULL, -- O tipo de dado é Agnóstico. 100, ou "Marketing", ou true
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, field_id) -- Uma task só tem um valor para um field
);

-- 3. Motor Nervoso de Dependências (Blockers)
CREATE TABLE IF NOT EXISTS public.orqflow_task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE, -- A Tarefa que EMPATEIA
    blocked_task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE, -- A Tarefa Refém
    dependency_type VARCHAR(50) DEFAULT 'blocking' CHECK (dependency_type IN ('blocking', 'waiting_on', 'related')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(blocker_task_id, blocked_task_id) -- Impede recursão óbvia simples
);

-- Índices Velozes
CREATE INDEX idx_orqflow_custom_values_task ON public.orqflow_task_custom_values(task_id);
CREATE INDEX idx_orqflow_dep_blocked ON public.orqflow_task_dependencies(blocked_task_id);
CREATE INDEX idx_orqflow_dep_blocker ON public.orqflow_task_dependencies(blocker_task_id);

-- HABILITAR RLS MURALHA (Epic 5)
ALTER TABLE public.orqflow_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_task_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_task_dependencies ENABLE ROW LEVEL SECURITY;

-- POLICIES DE RLS: Admins da Agência veem tudo
CREATE POLICY "Enable FULL for authenticated on custom fields" ON public.orqflow_custom_fields FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable FULL for authenticated on custom values" ON public.orqflow_task_custom_values FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable FULL for authenticated on dependencies" ON public.orqflow_task_dependencies FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- GATILHO DE PROTEÇÃO (Impedir Card de Fechar se Blocker não tiver Status 'done')
-- ==============================================================================
CREATE OR REPLACE FUNCTION check_orqflow_dependencies_before_close() RETURNS TRIGGER AS $$
DECLARE
    unfinished_blockers_count INTEGER;
BEGIN
    -- Se a pessoa está tentando mover o Card para 'review' ou 'done'
    IF NEW.status IN ('review', 'done') AND OLD.status NOT IN ('review', 'done') THEN
        -- Verificar quantas tarefas bloqueadoras desta tarefa AINDA não estão Done
        SELECT COUNT(*)
        INTO unfinished_blockers_count
        FROM orqflow_task_dependencies d
        JOIN orqflow_tasks t ON t.id = d.blocker_task_id
        WHERE d.blocked_task_id = NEW.id
          AND d.dependency_type = 'blocking'
          AND t.status NOT IN ('done', 'archived');

        IF unfinished_blockers_count > 0 THEN
            RAISE EXCEPTION 'This task is blocked by % unfinished tasks', unfinished_blockers_count;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orqflow_prevent_premature_close
BEFORE UPDATE ON public.orqflow_tasks
FOR EACH ROW EXECUTE FUNCTION check_orqflow_dependencies_before_close();
