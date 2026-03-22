-- ==============================================================================
-- ORQFLOW CORE ENGINE: MIGRATION
-- The ultimate Notion/ClickUp killer for RevHackers Ecosystem
-- ==============================================================================

-- 1. SPRINTS (Os Ciclos de MRR)
CREATE TABLE IF NOT EXISTS public.orqflow_sprints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TASKS (O Núcleo de Entrega)
CREATE TABLE IF NOT EXISTS public.orqflow_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES public.orqflow_sprints(id) ON DELETE SET NULL,
    
    title VARCHAR(500) NOT NULL,
    content JSONB DEFAULT '{}'::jsonb, -- Tiptap Block-Tree Structure (O Segredo do Notion)
    
    status VARCHAR(50) DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'doing', 'review', 'done', 'archived')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    
    position_order INTEGER DEFAULT 0, -- Dnd-Kit Fluid Kanban Positioning
    estimated_hours NUMERIC(5,2) DEFAULT 0, -- Para o Dashboard do Workload
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TASK DEPENDENCIES (O Motor do Gantt Chart)
CREATE TABLE IF NOT EXISTS public.orqflow_task_dependencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'blocking', -- tracking if task_id waits for depends_on_task_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, depends_on_task_id) -- Impede dependências duplicadas
);

-- 4. CUSTOM FIELDS (A Mutabilidade do ClickUp)
CREATE TABLE IF NOT EXISTS public.orqflow_custom_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES public.rei_projects(id) ON DELETE CASCADE, -- Se null, o custom field é Global para a Agência inteira
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'number', 'currency', 'url', 'rating', 'date', 'dropdown')),
    config JSONB DEFAULT '{}'::jsonb, -- Para salvar as opções do Dropdown ({ options: [{id, color, label}] })
    is_private BOOLEAN DEFAULT false, -- Esconde do Cliente final (ex: Custo Freelancer)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Valores dos Custom Fields
CREATE TABLE IF NOT EXISTS public.orqflow_task_custom_values (
    task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES public.orqflow_custom_fields(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (task_id, field_id)
);

-- 5. TIME TRACKING (A Auditoria Financeira Oculta)
CREATE TABLE IF NOT EXISTS public.orqflow_time_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. COMMENTS & THREADS (O Matador de WhatsApp)
CREATE TABLE IF NOT EXISTS public.orqflow_task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content JSONB NOT NULL, -- Permite marcação rica @membro usando Tiptap
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE (O(1) Lookups para as Queries React Query)
-- ==============================================================================
CREATE INDEX idx_orqflow_sprints_project ON public.orqflow_sprints(project_id);
CREATE INDEX idx_orqflow_tasks_sprint ON public.orqflow_tasks(sprint_id);
CREATE INDEX idx_orqflow_tasks_project ON public.orqflow_tasks(project_id);
CREATE INDEX idx_orqflow_tasks_status ON public.orqflow_tasks(status);
CREATE INDEX idx_orqflow_time_logs_task ON public.orqflow_time_logs(task_id);
CREATE INDEX idx_orqflow_deps_task ON public.orqflow_task_dependencies(task_id);

-- ==============================================================================
-- RLS POLICIES (MURALHA INTRASÍVEL)
-- ==============================================================================
ALTER TABLE public.orqflow_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_task_custom_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orqflow_task_comments ENABLE ROW LEVEL SECURITY;

-- Admins tem acesso global
CREATE POLICY "Enable ALL for authenticated" ON public.orqflow_tasks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for authenticated" ON public.orqflow_sprints FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for authenticated" ON public.orqflow_task_dependencies FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for authenticated" ON public.orqflow_custom_fields FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for authenticated" ON public.orqflow_task_custom_values FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for authenticated" ON public.orqflow_time_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable ALL for authenticated" ON public.orqflow_task_comments FOR ALL USING (auth.role() = 'authenticated');
