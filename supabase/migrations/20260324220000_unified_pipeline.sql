-- Migration: Unified Pipeline for RevHackers CRM
-- Purpose: Add pipeline stages, lead source tracking, stage history,
--          and opportunity data to unify the sales funnel from lead to completion.

-- ============================================================================
-- 1. PIPELINE_STAGE enum-like column on rei_projects
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rei_projects'
          AND column_name = 'pipeline_stage'
    ) THEN
        ALTER TABLE public.rei_projects
        ADD COLUMN pipeline_stage TEXT DEFAULT 'lead_inbound';
    END IF;
END $$;

-- Drop old constraint if it exists, then add the correct one
ALTER TABLE public.rei_projects DROP CONSTRAINT IF EXISTS rei_projects_pipeline_stage_check;
ALTER TABLE public.rei_projects ADD CONSTRAINT rei_projects_pipeline_stage_check
    CHECK (pipeline_stage IN (
        'lead_inbound',
        'lead_qualified',
        'diagnostic_done',
        'proposal_draft',
        'proposal_sent',
        'proposal_viewed',
        'negotiation',
        'won',
        'onboarding',
        'active',
        'completed',
        'lost',
        'churned'
    ));

-- Index for filtering by pipeline stage
CREATE INDEX IF NOT EXISTS idx_rei_projects_pipeline_stage
    ON public.rei_projects(pipeline_stage);

COMMENT ON COLUMN public.rei_projects.pipeline_stage
    IS 'Unified pipeline stage: lead_inbound, lead_qualified, diagnostic_done, proposal_draft, proposal_sent, proposal_viewed, negotiation, won, onboarding, active, completed, lost, churned';

-- ============================================================================
-- 2. LEAD_SOURCE column on rei_projects
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rei_projects'
          AND column_name = 'lead_source'
    ) THEN
        ALTER TABLE public.rei_projects
        ADD COLUMN lead_source TEXT DEFAULT 'manual';
    END IF;
END $$;

ALTER TABLE public.rei_projects DROP CONSTRAINT IF EXISTS rei_projects_lead_source_check;
ALTER TABLE public.rei_projects ADD CONSTRAINT rei_projects_lead_source_check
    CHECK (lead_source IN (
        'diagnostico_growth',
        'diagnostico_revenue',
        'diagnostico_founder',
        'diagnostico_site',
        'ghl_calendar',
        'referral',
        'cold_outbound',
        'manual'
    ));

CREATE INDEX IF NOT EXISTS idx_rei_projects_lead_source
    ON public.rei_projects(lead_source);

COMMENT ON COLUMN public.rei_projects.lead_source
    IS 'Origin of the lead: diagnostico_growth, diagnostico_revenue, diagnostico_founder, diagnostico_site, ghl_calendar, referral, cold_outbound, manual';

-- ============================================================================
-- 3. DIAGNOSTICO_ID FK on rei_projects -> diagnostico
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rei_projects'
          AND column_name = 'diagnostico_id'
    ) THEN
        ALTER TABLE public.rei_projects
        ADD COLUMN diagnostico_id UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'rei_projects_diagnostico_id_fkey'
          AND table_name = 'rei_projects'
    ) THEN
        ALTER TABLE public.rei_projects
        ADD CONSTRAINT rei_projects_diagnostico_id_fkey
        FOREIGN KEY (diagnostico_id) REFERENCES public.diagnosticos(id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_rei_projects_diagnostico_id
    ON public.rei_projects(diagnostico_id);

-- ============================================================================
-- 4. REI_PROJECT_ID FK on proposals -> rei_projects
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'proposals'
          AND column_name = 'rei_project_id'
    ) THEN
        ALTER TABLE public.proposals
        ADD COLUMN rei_project_id UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'proposals_rei_project_id_fkey'
          AND table_name = 'proposals'
    ) THEN
        ALTER TABLE public.proposals
        ADD CONSTRAINT proposals_rei_project_id_fkey
        FOREIGN KEY (rei_project_id) REFERENCES public.rei_projects(id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proposals_rei_project_id
    ON public.proposals(rei_project_id);

-- ============================================================================
-- 5. PIPELINE_STAGE_HISTORY table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.pipeline_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rei_project_id UUID NOT NULL REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_pipeline_stage_history_project
    ON public.pipeline_stage_history(rei_project_id);

CREATE INDEX IF NOT EXISTS idx_pipeline_stage_history_changed_at
    ON public.pipeline_stage_history(changed_at);

COMMENT ON TABLE public.pipeline_stage_history
    IS 'Audit log of pipeline stage transitions for rei_projects';

-- ============================================================================
-- 6. OPPORTUNITY_DATA JSONB on rei_projects
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'rei_projects'
          AND column_name = 'opportunity_data'
    ) THEN
        ALTER TABLE public.rei_projects
        ADD COLUMN opportunity_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

COMMENT ON COLUMN public.rei_projects.opportunity_data
    IS 'Sales intelligence JSON: score_fechamento, sinais_compra, objecoes, investimento';

-- ============================================================================
-- 7. BACKFILL pipeline_stage from existing status
-- ============================================================================

UPDATE public.rei_projects
SET pipeline_stage = CASE
    WHEN status = 'lead' THEN 'lead_qualified'
    WHEN status = 'diagnostic' THEN 'diagnostic_done'
    WHEN status = 'active' THEN 'active'
    WHEN status = 'pending' THEN 'active'
    WHEN status = 'overdue' THEN 'active'
    ELSE 'lead_inbound'
END
WHERE pipeline_stage IS NULL
   OR pipeline_stage = 'lead_inbound';

-- ============================================================================
-- 8. RLS for pipeline_stage_history
-- ============================================================================

ALTER TABLE public.pipeline_stage_history ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all stage history
DROP POLICY IF EXISTS "Authenticated users can read pipeline history" ON public.pipeline_stage_history;
CREATE POLICY "Authenticated users can read pipeline history"
    ON public.pipeline_stage_history FOR SELECT
    TO authenticated
    USING (true);

-- Service role has full access (handled by default - service_role bypasses RLS)
-- Authenticated super_admin can insert/update for manual stage changes
DROP POLICY IF EXISTS "Super admin can insert pipeline history" ON public.pipeline_stage_history;
CREATE POLICY "Super admin can insert pipeline history"
    ON public.pipeline_stage_history FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super admin can update pipeline history" ON public.pipeline_stage_history;
CREATE POLICY "Super admin can update pipeline history"
    ON public.pipeline_stage_history FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "Super admin can delete pipeline history" ON public.pipeline_stage_history;
CREATE POLICY "Super admin can delete pipeline history"
    ON public.pipeline_stage_history FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
