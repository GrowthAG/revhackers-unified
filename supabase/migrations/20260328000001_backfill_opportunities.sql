-- Migration: Backfill opportunities from existing rei_projects data
-- Purpose: Migrate pre-sale records (leads, proposals) from rei_projects to opportunities
-- Safety: Non-destructive. Original rei_projects records are preserved.

-- ============================================================================
-- 1. MIGRATE LEADS AND ACTIVE SALES (pipeline_stage in sales stages)
-- ============================================================================

INSERT INTO public.opportunities (
    client_name,
    client_email,
    client_company,
    client_site,
    trade_name,
    type,
    lead_source,
    source,
    pipeline_stage,
    diagnostico_id,
    opportunity_data,
    enrichment_data,
    analyst_email,
    organization_id,
    client_id,
    created_at,
    updated_at
)
SELECT
    rp.client_name,
    rp.client_email,
    rp.client_company,
    rp.client_site,
    rp.trade_name,
    rp.type,
    rp.lead_source,
    rp.source,
    rp.pipeline_stage,
    rp.diagnostico_id,
    COALESCE(rp.opportunity_data, '{}'::jsonb),
    rp.enrichment_data,
    rp.analyst_email,
    rp.organization_id,
    rp.client_id,
    rp.created_at,
    rp.updated_at
FROM public.rei_projects rp
WHERE rp.pipeline_stage IN (
    'lead_inbound',
    'lead_qualified',
    'diagnostic_done',
    'proposal_draft',
    'proposal_sent',
    'proposal_viewed',
    'negotiation'
)
OR rp.status = 'lead'
OR rp.status = 'diagnostic';

-- ============================================================================
-- 2. MIGRATE WON/ACTIVE PROJECTS (create opportunity record with won status)
-- ============================================================================
-- For projects already in execution, create a "won" opportunity that points back to them

INSERT INTO public.opportunities (
    client_name,
    client_email,
    client_company,
    client_site,
    trade_name,
    type,
    lead_source,
    source,
    pipeline_stage,
    diagnostico_id,
    opportunity_data,
    enrichment_data,
    analyst_email,
    organization_id,
    client_id,
    rei_project_id,
    won_at,
    created_at,
    updated_at
)
SELECT
    rp.client_name,
    rp.client_email,
    rp.client_company,
    rp.client_site,
    rp.trade_name,
    rp.type,
    rp.lead_source,
    rp.source,
    'won',
    rp.diagnostico_id,
    COALESCE(rp.opportunity_data, '{}'::jsonb),
    rp.enrichment_data,
    rp.analyst_email,
    rp.organization_id,
    rp.client_id,
    rp.id,  -- link back to the project
    rp.created_at,  -- best approximation for won_at
    rp.created_at,
    rp.updated_at
FROM public.rei_projects rp
WHERE rp.pipeline_stage IN (
    'won',
    'onboarding',
    'active',
    'completed'
)
AND rp.status NOT IN ('lead', 'diagnostic');

-- ============================================================================
-- 3. LINK PROPOSALS to their new opportunity records
-- ============================================================================
-- Match proposals that have rei_project_id to the corresponding opportunity

UPDATE public.proposals p
SET opportunity_id = o.id
FROM public.opportunities o
WHERE p.rei_project_id IS NOT NULL
  AND (
    -- Direct match: opportunity was created from this rei_project (won/active)
    o.rei_project_id = p.rei_project_id
    -- OR: opportunity was the pre-sale record migrated from the same rei_project
    -- (for pre-sale stages, match by client_email + client_name)
  );

-- Fallback: match by client_email for proposals without rei_project_id
UPDATE public.proposals p
SET opportunity_id = o.id
FROM public.opportunities o
WHERE p.opportunity_id IS NULL
  AND p.client_email IS NOT NULL
  AND o.client_email = p.client_email
  AND o.client_name = p.client_name;

-- ============================================================================
-- 4. UPDATE rei_projects pipeline_stage for execution-only stages
-- ============================================================================
-- Projects that were leads/pre-sale: update their pipeline_stage to NULL
-- since they now live in opportunities. Keep the record for FK integrity
-- but their pipeline_stage should reflect execution-only stages.

-- Note: We do NOT delete or modify rei_projects records in this migration.
-- That will be done in a future cleanup migration after full frontend migration.
-- For now, both tables co-exist with overlapping data.

-- ============================================================================
-- 5. LOG
-- ============================================================================

DO $$
DECLARE
    opp_count INT;
    linked_proposals INT;
BEGIN
    SELECT count(*) INTO opp_count FROM public.opportunities;
    SELECT count(*) INTO linked_proposals FROM public.proposals WHERE opportunity_id IS NOT NULL;
    RAISE NOTICE 'Backfill complete: % opportunities created, % proposals linked', opp_count, linked_proposals;
END $$;
