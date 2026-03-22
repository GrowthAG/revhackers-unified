-- Adiciona coluna de dados de enriquecimento automatico em rei_projects
-- Armazena: CNPJ (Receita Federal via BrasilAPI), performance do site (Google PSI)
-- Idempotente - seguro rodar multiplas vezes

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name   = 'rei_projects'
          AND column_name  = 'enrichment_data'
    ) THEN
        ALTER TABLE public.rei_projects
            ADD COLUMN enrichment_data JSONB DEFAULT NULL;

        COMMENT ON COLUMN public.rei_projects.enrichment_data IS
            'Dados de enriquecimento automatico: cnpj (BrasilAPI), site_perf (Google PSI), enriched_at';
    END IF;
END $$;

-- Indice para queries sobre enrichment_data
CREATE INDEX IF NOT EXISTS idx_rei_projects_enrichment_data
    ON public.rei_projects USING gin(enrichment_data);
