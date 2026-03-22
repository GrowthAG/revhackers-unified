-- ==============================================================================
-- REVHACKERS PROJECT OS: SPRINTS E TASKS (CLICKUP/NOTION KILLER)
-- ==============================================================================

-- 1. Tabela de SPRINTS (Ciclos Mensais)
CREATE TABLE IF NOT EXISTS project_sprints (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES rei_projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Ex: "Mês 1: Setup e Fundação"
    goal TEXT, -- Explicativo da sprint
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de TASKS (Tarefas individuais / Cards do Kanban)
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES rei_projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES project_sprints(id) ON DELETE SET NULL, -- Se a sprint sumir, a task volta pro backlog
    title VARCHAR(255) NOT NULL,
    
    -- O 'content' vai guardar o JSON gigantesco do TipTap (O nosso Notion-Like Editor)
    content JSONB DEFAULT '{}'::jsonb, 
    
    status VARCHAR(50) DEFAULT 'backlog' CHECK (status IN ('backlog', 'todo', 'doing', 'review', 'done')),
    priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    assignee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Quem vai executar a tarefa
    due_date TIMESTAMP WITH TIME ZONE, -- Prazo de entrega
    
    -- Kanban ordering (Para saber a posição do card na coluna, ex: 1000, 2000, 3000)
    position_order INTEGER DEFAULT 0, 

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexação para o Kanban rodar voando sem gargalos de banco de dados
CREATE INDEX idx_project_tasks_sprint ON project_tasks(sprint_id);
CREATE INDEX idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_project_sprints_project ON project_sprints(project_id);

-- ==============================================================================
-- SECURITY (RLS POLICIES)
-- ==============================================================================

ALTER TABLE project_sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Sprints Policies (Todos autenticados podem ver os sprints de projetos que têm acesso)
CREATE POLICY "Users can view sprints" 
ON project_sprints FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert sprints" 
ON project_sprints FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update sprints" 
ON project_sprints FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete sprints" 
ON project_sprints FOR DELETE USING (auth.role() = 'authenticated');

-- Tasks Policies
CREATE POLICY "Users can view tasks" 
ON project_tasks FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can insert tasks" 
ON project_tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin can update tasks" 
ON project_tasks FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete tasks" 
ON project_tasks FOR DELETE USING (auth.role() = 'authenticated');
