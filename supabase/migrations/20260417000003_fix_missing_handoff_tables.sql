-- Fix emergencial: a tabela handoff_idempotency nunca foi criada no banco remoto.
-- A RPC convert_opportunity_to_project_v2 depende dela e falha com 
-- "relation handoff_idempotency does not exist".

CREATE TABLE IF NOT EXISTS public.handoff_idempotency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key UUID UNIQUE NOT NULL,
    opportunity_id UUID NOT NULL,
    project_id UUID,
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_idempotency_key ON public.handoff_idempotency(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_opportunity ON public.handoff_idempotency(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_handoff_idempotency_deleted ON public.handoff_idempotency(deleted_at);

ALTER TABLE public.handoff_idempotency ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read idempotency" ON public.handoff_idempotency;
CREATE POLICY "Authenticated users can read idempotency"
    ON public.handoff_idempotency FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role can insert idempotency" ON public.handoff_idempotency;
CREATE POLICY "Service role can insert idempotency"
    ON public.handoff_idempotency FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Tambem garantir que handoff_metrics existe
CREATE TABLE IF NOT EXISTS public.handoff_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL,
    project_id UUID,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_hours NUMERIC,
    sla_met BOOLEAN DEFAULT false,
    validation_passed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.handoff_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage handoff_metrics" ON public.handoff_metrics;
CREATE POLICY "Service role can manage handoff_metrics"
    ON public.handoff_metrics FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read handoff_metrics" ON public.handoff_metrics;
CREATE POLICY "Authenticated users can read handoff_metrics"
    ON public.handoff_metrics FOR SELECT
    TO authenticated
    USING (true);

-- Garantir que pipeline_stage_history existe  
CREATE TABLE IF NOT EXISTS public.pipeline_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rei_project_id UUID NOT NULL,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    notes TEXT,
    changed_by TEXT DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pipeline_stage_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage pipeline_stage_history" ON public.pipeline_stage_history;
CREATE POLICY "Service role can manage pipeline_stage_history"
    ON public.pipeline_stage_history FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read pipeline_stage_history" ON public.pipeline_stage_history;
CREATE POLICY "Authenticated users can read pipeline_stage_history"
    ON public.pipeline_stage_history FOR SELECT
    TO authenticated
    USING (true);

COMMENT ON TABLE public.handoff_idempotency IS 'Tracks idempotency keys to prevent duplicate processing';
