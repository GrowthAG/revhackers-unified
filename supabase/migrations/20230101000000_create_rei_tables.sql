-- REI Quarterly System - Supabase Schema (Integrado ao CMS)
-- Segue os mesmos padrões do CMS headless: RLS first, schema rígido, FK para profiles

-- ============================================================================
-- TABELA: public.rei_projects
-- Propósito: Projetos REI com renovação trimestral
-- Autor: NÃO (institucional, como cases/materials)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rei_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Dados do Cliente
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    
    -- Gestão Interna
    analyst_email TEXT NOT NULL, -- Email do analista responsável
    
    -- Datas e Quarter
    last_rei_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    next_rei_date TIMESTAMP WITH TIME ZONE NOT NULL,
    quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    year INTEGER NOT NULL,
    
    -- Status (calculado automaticamente)
    status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'overdue')) DEFAULT 'active',
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA: public.rei_responses
-- Propósito: Histórico de diagnósticos REI completados
-- Relação: 1 projeto → N respostas (histórico)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.rei_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relacionamento
    project_id UUID NOT NULL REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    
    -- Dados do Diagnóstico
    responses JSONB NOT NULL, -- Todas as respostas do questionário
    total_score INTEGER NOT NULL,
    maturity_level TEXT NOT NULL,
    maturity_percentage DECIMAL(5,2) NOT NULL,
    
    -- Metadados
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES (Performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rei_projects_status ON public.rei_projects(status);
CREATE INDEX IF NOT EXISTS idx_rei_projects_next_date ON public.rei_projects(next_rei_date);
CREATE INDEX IF NOT EXISTS idx_rei_projects_analyst ON public.rei_projects(analyst_email);
CREATE INDEX IF NOT EXISTS idx_rei_projects_client_email ON public.rei_projects(client_email);
CREATE INDEX IF NOT EXISTS idx_rei_responses_project ON public.rei_responses(project_id);
CREATE INDEX IF NOT EXISTS idx_rei_responses_completed ON public.rei_responses(completed_at);

-- ============================================================================
-- TRIGGERS (Automação)
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_rei_projects_updated_at ON public.rei_projects;
CREATE TRIGGER update_rei_projects_updated_at
    BEFORE UPDATE ON public.rei_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular próximo quarter
CREATE OR REPLACE FUNCTION calculate_next_quarter(p_ref_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    quarter TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    year INTEGER
) AS $$
DECLARE
    month INTEGER;
    next_quarter TEXT;
    next_year INTEGER;
    start_month INTEGER;
BEGIN
    month := EXTRACT(MONTH FROM p_ref_date);
    next_year := EXTRACT(YEAR FROM p_ref_date);
    
    IF month < 4 THEN
        next_quarter := 'Q2';
        start_month := 4;
    ELSIF month < 7 THEN
        next_quarter := 'Q3';
        start_month := 7;
    ELSIF month < 10 THEN
        next_quarter := 'Q4';
        start_month := 10;
    ELSE
        next_quarter := 'Q1';
        start_month := 1;
        next_year := next_year + 1;
    END IF;
    
    RETURN QUERY SELECT 
        next_quarter,
        make_timestamp(next_year, start_month, 1, 0, 0, 0),
        next_year;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status baseado na data (executar via cron ou manualmente)
CREATE OR REPLACE FUNCTION update_rei_status()
RETURNS void AS $$
BEGIN
    UPDATE public.rei_projects
    SET status = CASE
        WHEN next_rei_date < NOW() THEN 'overdue'
        WHEN next_rei_date <= NOW() + INTERVAL '14 days' THEN 'pending'
        ELSE 'active'
    END
    WHERE status != CASE
        WHEN next_rei_date < NOW() THEN 'overdue'
        WHEN next_rei_date <= NOW() + INTERVAL '14 days' THEN 'pending'
        ELSE 'active'
    END;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS (Row Level Security) - Seguindo padrão do CMS
-- ============================================================================

ALTER TABLE public.rei_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rei_responses ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: rei_projects
-- ============================================================================

-- SELECT: Apenas usuários autenticados (analistas internos)
DROP POLICY IF EXISTS "Authenticated users can view REI projects" ON public.rei_projects;
CREATE POLICY "Authenticated users can view REI projects"
    ON public.rei_projects FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Apenas super_admin pode criar projetos
DROP POLICY IF EXISTS "Super admin can insert REI projects" ON public.rei_projects;
CREATE POLICY "Super admin can insert REI projects"
    ON public.rei_projects FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- UPDATE: Apenas super_admin pode atualizar projetos
DROP POLICY IF EXISTS "Super admin can update REI projects" ON public.rei_projects;
CREATE POLICY "Super admin can update REI projects"
    ON public.rei_projects FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- DELETE: Apenas super_admin pode deletar projetos
DROP POLICY IF EXISTS "Super admin can delete REI projects" ON public.rei_projects;
CREATE POLICY "Super admin can delete REI projects"
    ON public.rei_projects FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- POLICIES: rei_responses
-- ============================================================================

-- SELECT: Usuários autenticados podem ver respostas
DROP POLICY IF EXISTS "Authenticated users can view REI responses" ON public.rei_responses;
CREATE POLICY "Authenticated users can view REI responses"
    ON public.rei_responses FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Qualquer usuário autenticado pode inserir resposta (cliente fazendo diagnóstico)
DROP POLICY IF EXISTS "Authenticated users can insert REI responses" ON public.rei_responses;
CREATE POLICY "Authenticated users can insert REI responses"
    ON public.rei_responses FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE/DELETE: Apenas super_admin
DROP POLICY IF EXISTS "Super admin can update REI responses" ON public.rei_responses;
CREATE POLICY "Super admin can update REI responses"
    ON public.rei_responses FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super admin can delete REI responses" ON public.rei_responses;
CREATE POLICY "Super admin can delete REI responses"
    ON public.rei_responses FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- COMENTÁRIOS (Documentação)
-- ============================================================================

COMMENT ON TABLE public.rei_projects IS 'Projetos REI com renovação trimestral - Gestão interna de diagnósticos de clientes';
COMMENT ON TABLE public.rei_responses IS 'Histórico de respostas dos diagnósticos REI completados';

COMMENT ON COLUMN public.rei_projects.status IS 'Status calculado: active (>14 dias), pending (<=14 dias), overdue (atrasado)';
COMMENT ON COLUMN public.rei_projects.quarter IS 'Quarter do próximo REI: Q1 (Jan), Q2 (Abr), Q3 (Jul), Q4 (Out)';
COMMENT ON COLUMN public.rei_projects.analyst_email IS 'Email do analista de marketing responsável pelo projeto';

COMMENT ON COLUMN public.rei_responses.responses IS 'JSONB com todas as respostas do questionário REI';
COMMENT ON COLUMN public.rei_responses.maturity_level IS 'Nível de maturidade: Fundação, Estruturação, Escala, Otimização, World Class';

-- ============================================================================
-- FIM DO SCHEMA REI
-- ============================================================================
