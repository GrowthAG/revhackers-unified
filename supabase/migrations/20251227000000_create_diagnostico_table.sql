-- TABELA: public.diagnostico
-- Propósito: Armazenar resultados de diagnósticos públicos (Growth, Revenue, Founder, Site)
-- Separado do sistema interno REI (rei_projects/rei_responses)

CREATE TABLE IF NOT EXISTS public.diagnostico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Dados do Lead
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    empresa TEXT,
    cargo TEXT,
    telefone TEXT,
    linkedin_url TEXT,
    
    -- Dados do Diagnóstico
    tipo_diagnostico TEXT NOT NULL, -- 'Growth Score', 'Revenue Score', etc.
    respostas JSONB NOT NULL DEFAULT '{}'::jsonb,
    score INTEGER NOT NULL,
    total_pontos INTEGER, -- Para casos onde o score é porcentagem
    nivel_maturidade TEXT,
    detalhes_resultado JSONB -- Armazena título, headline, descrição, cor, etc.
);

-- Habilitar RLS
ALTER TABLE public.diagnostico ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- 1. Insert Público (Anon)
DROP POLICY IF EXISTS "Enable public insert for diagnostico" ON public.diagnostico;
CREATE POLICY "Enable public insert for diagnostico"
ON public.diagnostico FOR INSERT
TO anon
WITH CHECK (true);

-- 2. Select Público (Anon) - Para visualizar o resultado via link
DROP POLICY IF EXISTS "Enable public select for diagnostico" ON public.diagnostico;
CREATE POLICY "Enable public select for diagnostico"
ON public.diagnostico FOR SELECT
TO anon
USING (true);

-- 3. Select Autenticado (Admin)
DROP POLICY IF EXISTS "Enable admin select for diagnostico" ON public.diagnostico;
CREATE POLICY "Enable admin select for diagnostico"
ON public.diagnostico FOR SELECT
TO authenticated
USING (true);

-- Index para performance
CREATE INDEX IF NOT EXISTS idx_diagnostico_email ON public.diagnostico(email);
CREATE INDEX IF NOT EXISTS idx_diagnostico_created_at ON public.diagnostico(created_at);
