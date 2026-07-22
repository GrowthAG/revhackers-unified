-- Migration: GrowthMap results table
-- Created: 2026-07-22

CREATE TABLE IF NOT EXISTS public.growthmap_results (
    id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id          TEXT NOT NULL,
    company_name        TEXT NOT NULL DEFAULT '',
    company_description TEXT NOT NULL DEFAULT '',
    rei_score           NUMERIC,
    growthmap_score     NUMERIC,
    rei_connections_count INT DEFAULT 0,
    frameworks          JSONB NOT NULL DEFAULT '{}',
    generated_at        TIMESTAMPTZ,
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT growthmap_results_project_id_unique UNIQUE (project_id)
);

-- Index for fast lookup by project
CREATE INDEX IF NOT EXISTS idx_growthmap_results_project_id ON public.growthmap_results (project_id);

-- RLS
ALTER TABLE public.growthmap_results ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write their own project's growthmap
CREATE POLICY "growthmap_results_authenticated_rw"
ON public.growthmap_results
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_growthmap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_growthmap_updated_at ON public.growthmap_results;
CREATE TRIGGER trg_growthmap_updated_at
BEFORE UPDATE ON public.growthmap_results
FOR EACH ROW EXECUTE FUNCTION public.set_growthmap_updated_at();

COMMENT ON TABLE public.growthmap_results IS
'Stores GrowthMap strategic framework results per project. Each row holds the full frameworks JSONB blob with all generated analyses.';
