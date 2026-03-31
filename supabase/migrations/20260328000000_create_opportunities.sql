-- Migration: Create opportunities table
-- Purpose: Separate sales lifecycle (opportunities) from project execution (rei_projects)
-- An opportunity tracks the pre-sale journey: lead -> qualified -> diagnostic -> proposal -> negotiation -> won/lost
-- A rei_project is created ONLY when an opportunity is won (post-sale execution)

-- ============================================================================
-- 1. OPPORTUNITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Client identification
    client_name TEXT NOT NULL,
    client_email TEXT,
    client_company TEXT,
    client_site TEXT,
    client_logo TEXT,
    trade_name TEXT,

    -- Classification
    type TEXT NOT NULL DEFAULT 'consulting',
    lead_source TEXT DEFAULT 'manual',
    source TEXT,

    -- Sales pipeline
    pipeline_stage TEXT NOT NULL DEFAULT 'lead_inbound',

    -- Intelligence data
    diagnostico_id UUID,
    opportunity_data JSONB DEFAULT '{}'::jsonb,
    enrichment_data JSONB,

    -- Meeting / Discovery
    meeting_recording_id UUID,

    -- Ownership
    analyst_email TEXT DEFAULT 'giulliano@revhackers.com',
    organization_id UUID,

    -- Lifecycle links (populated on won)
    client_id UUID,
    rei_project_id UUID,
    won_at TIMESTAMPTZ,
    lost_at TIMESTAMPTZ,
    lost_reason TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. CONSTRAINTS
-- ============================================================================

ALTER TABLE public.opportunities
    ADD CONSTRAINT opportunities_pipeline_stage_check
    CHECK (pipeline_stage IN (
        'lead_inbound',
        'lead_qualified',
        'diagnostic_done',
        'proposal_draft',
        'proposal_sent',
        'proposal_viewed',
        'negotiation',
        'won',
        'lost'
    ));

ALTER TABLE public.opportunities
    ADD CONSTRAINT opportunities_lead_source_check
    CHECK (lead_source IS NULL OR lead_source IN (
        'diagnostico_growth',
        'diagnostico_revenue',
        'diagnostico_founder',
        'diagnostico_site',
        'ghl_calendar',
        'referral',
        'cold_outbound',
        'manual'
    ));

-- ============================================================================
-- 3. FOREIGN KEYS
-- ============================================================================

ALTER TABLE public.opportunities
    ADD CONSTRAINT opportunities_diagnostico_id_fkey
    FOREIGN KEY (diagnostico_id) REFERENCES public.diagnosticos(id) ON DELETE SET NULL;

ALTER TABLE public.opportunities
    ADD CONSTRAINT opportunities_client_id_fkey
    FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.opportunities
    ADD CONSTRAINT opportunities_rei_project_id_fkey
    FOREIGN KEY (rei_project_id) REFERENCES public.rei_projects(id) ON DELETE SET NULL;

ALTER TABLE public.opportunities
    ADD CONSTRAINT opportunities_organization_id_fkey
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE SET NULL;

-- meeting_recordings FK (if table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'meeting_recordings'
    ) THEN
        ALTER TABLE public.opportunities
            ADD CONSTRAINT opportunities_meeting_recording_id_fkey
            FOREIGN KEY (meeting_recording_id) REFERENCES public.meeting_recordings(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_opportunities_pipeline_stage ON public.opportunities(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_lead_source ON public.opportunities(lead_source);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_email ON public.opportunities(client_email);
CREATE INDEX IF NOT EXISTS idx_opportunities_client_id ON public.opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_rei_project_id ON public.opportunities(rei_project_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON public.opportunities(created_at);

-- ============================================================================
-- 5. OPPORTUNITY STAGE HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    changed_by TEXT,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_opp_stage_history_opportunity ON public.opportunity_stage_history(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_opp_stage_history_changed_at ON public.opportunity_stage_history(changed_at);

-- ============================================================================
-- 6. ADD opportunity_id FK TO PROPOSALS
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'proposals'
          AND column_name = 'opportunity_id'
    ) THEN
        ALTER TABLE public.proposals ADD COLUMN opportunity_id UUID;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'proposals_opportunity_id_fkey'
          AND table_name = 'proposals'
    ) THEN
        ALTER TABLE public.proposals
        ADD CONSTRAINT proposals_opportunity_id_fkey
        FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_proposals_opportunity_id ON public.proposals(opportunity_id);

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_stage_history ENABLE ROW LEVEL SECURITY;

-- Opportunities: authenticated read
DROP POLICY IF EXISTS "Authenticated users can read opportunities" ON public.opportunities;
CREATE POLICY "Authenticated users can read opportunities"
    ON public.opportunities FOR SELECT
    TO authenticated
    USING (true);

-- Opportunities: super_admin write
DROP POLICY IF EXISTS "Super admin can manage opportunities" ON public.opportunities;
CREATE POLICY "Super admin can manage opportunities"
    ON public.opportunities FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Service role bypass for edge functions (default Supabase behavior)

-- Stage history: authenticated read
DROP POLICY IF EXISTS "Authenticated users can read opportunity stage history" ON public.opportunity_stage_history;
CREATE POLICY "Authenticated users can read opportunity stage history"
    ON public.opportunity_stage_history FOR SELECT
    TO authenticated
    USING (true);

-- Stage history: super_admin insert
DROP POLICY IF EXISTS "Super admin can insert opportunity stage history" ON public.opportunity_stage_history;
CREATE POLICY "Super admin can insert opportunity stage history"
    ON public.opportunity_stage_history FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- 8. RPC: convert_opportunity_to_project (atomic transaction)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.convert_opportunity_to_project(
    p_opportunity_id UUID,
    p_analyst_email TEXT DEFAULT 'giulliano@revhackers.com'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_opp RECORD;
    v_project_id UUID;
    v_quarter TEXT;
BEGIN
    -- 1. Fetch and lock the opportunity
    SELECT * INTO v_opp
    FROM public.opportunities
    WHERE id = p_opportunity_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Opportunity not found: %', p_opportunity_id;
    END IF;

    IF v_opp.pipeline_stage != 'won' AND v_opp.pipeline_stage != 'negotiation' THEN
        RAISE EXCEPTION 'Opportunity must be in won or negotiation stage to convert. Current: %', v_opp.pipeline_stage;
    END IF;

    -- If already converted, return existing project
    IF v_opp.rei_project_id IS NOT NULL THEN
        RETURN v_opp.rei_project_id;
    END IF;

    -- 2. Calculate quarter
    v_quarter := 'Q' || CEIL(EXTRACT(MONTH FROM now()) / 3.0)::INT;

    -- 3. Create the rei_project (execution entity)
    -- CRITICAL: copy all intelligence data accumulated during the sales cycle
    INSERT INTO public.rei_projects (
        client_id,
        client_name,
        client_email,
        client_company,
        client_site,
        trade_name,
        type,
        lead_source,
        analyst_email,
        quarter,
        year,
        status,
        pipeline_stage,
        diagnostico_id,
        opportunity_data,
        enrichment_data,
        organization_id,
        next_rei_date
    ) VALUES (
        v_opp.client_id,
        v_opp.client_name,
        COALESCE(v_opp.client_email, 'nao-informado@revhackers.com'),
        v_opp.client_company,
        v_opp.client_site,
        v_opp.trade_name,
        COALESCE(v_opp.type, 'consulting'),
        v_opp.lead_source,
        COALESCE(p_analyst_email, 'giulliano@revhackers.com'),
        v_quarter,
        EXTRACT(YEAR FROM now())::INT,
        'preparation',
        'onboarding',
        v_opp.diagnostico_id,
        COALESCE(v_opp.opportunity_data, '{}'::jsonb),
        v_opp.enrichment_data,
        v_opp.organization_id,
        now() + INTERVAL '7 days'
    )
    RETURNING id INTO v_project_id;

    -- 4. Link project back to opportunity
    UPDATE public.opportunities
    SET
        rei_project_id = v_project_id,
        pipeline_stage = 'won',
        won_at = COALESCE(v_opp.won_at, now()),
        updated_at = now()
    WHERE id = p_opportunity_id;

    -- 5. Record stage history
    INSERT INTO public.opportunity_stage_history (opportunity_id, from_stage, to_stage, notes)
    VALUES (p_opportunity_id, v_opp.pipeline_stage, 'won', 'Convertido para projeto - ID: ' || v_project_id);

    INSERT INTO public.pipeline_stage_history (rei_project_id, from_stage, to_stage, notes)
    VALUES (v_project_id, NULL, 'onboarding', 'Projeto criado a partir da oportunidade ' || p_opportunity_id);

    RETURN v_project_id;
END;
$$;

-- ============================================================================
-- 9. COMMENTS
-- ============================================================================

COMMENT ON TABLE public.opportunities IS 'Sales lifecycle entity: tracks leads from inbound through won/lost. Separate from rei_projects (execution).';
COMMENT ON TABLE public.opportunity_stage_history IS 'Audit log of pipeline stage transitions for opportunities.';
COMMENT ON COLUMN public.opportunities.rei_project_id IS 'FK to rei_project created when opportunity is won. NULL until conversion.';
COMMENT ON COLUMN public.opportunities.diagnostico_id IS 'FK to diagnostico if lead filled a diagnostic form (pre-sale intelligence).';
COMMENT ON COLUMN public.proposals.opportunity_id IS 'FK to opportunity this proposal belongs to (replaces rei_project_id for sales context).';
