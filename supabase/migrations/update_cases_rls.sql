-- TABELA: public.cases
-- Propósito: Cases de Sucesso (Success Stories)

CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL, -- Título do case (Ex: "Como a X aumentou Y")
    slug TEXT UNIQUE NOT NULL, -- Slug para URL
    
    -- Conteúdo
    description TEXT, -- Descrição curta / Resumo
    challenge TEXT, -- O Desafio
    solution TEXT, -- A Solução
    results TEXT, -- Resultados (Texto ou JSON/Lista)
    
    -- Mídia
    image_url TEXT, -- Imagem de capa/logo do cliente
    video_url TEXT, -- Link de vídeo (opcional)
    
    -- Metadados do Cliente
    client_name TEXT, -- Nome do Cliente/Empresa
    client_logo TEXT, -- Logo específica se diferente da capa
    industry TEXT, -- Indústria
    
    -- Depoimento
    testimonial TEXT, -- Texto do depoimento
    testimonial_author TEXT, -- Nome do autor
    testimonial_role TEXT, -- Cargo do autor
    testimonial_avatar TEXT, -- Avatar do autor (opcional)
    
    -- Métricas (Highlights)
    metrics JSONB, -- Ex: [{"label": "ROI", "value": "300%"}, {"label": "Leads", "value": "2x"}]
    
    -- Estado
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false, -- Destaque na home?
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- SELECT: Public (Todos podem ver cases publicados)
DROP POLICY IF EXISTS "Public can view published cases" ON public.cases;
CREATE POLICY "Public can view published cases"
    ON public.cases FOR SELECT
    USING (published = true);

-- SELECT: Authenticated (Podem ver todos, inclusive rascunhos)
DROP POLICY IF EXISTS "Authenticated can view all cases" ON public.cases;
CREATE POLICY "Authenticated can view all cases"
    ON public.cases FOR SELECT
    TO authenticated
    USING (true);

-- INSERT: Authenticated (Admin)
DROP POLICY IF EXISTS "Authenticated can insert cases" ON public.cases;
CREATE POLICY "Authenticated can insert cases"
    ON public.cases FOR INSERT
    TO authenticated
    WITH CHECK (true); -- Idealmente checar role 'admin', mas authenticated serve por enquanto

-- UPDATE: Authenticated (Admin)
DROP POLICY IF EXISTS "Authenticated can update cases" ON public.cases;
CREATE POLICY "Authenticated can update cases"
    ON public.cases FOR UPDATE
    TO authenticated
    USING (true);

-- DELETE: Authenticated (Admin)
DROP POLICY IF EXISTS "Authenticated can delete cases" ON public.cases;
CREATE POLICY "Authenticated can delete cases"
    ON public.cases FOR DELETE
    TO authenticated
    USING (true);

-- TRIGGER UPDATE_AT
DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON public.cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
