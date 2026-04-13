-- ============================================================================
-- MIGRATION: Idempotency Keys
-- Purpose: Prevent duplicate handoff processing
-- Date: 2026-04-03
-- ============================================================================

-- 1. Create idempotency table
CREATE TABLE IF NOT EXISTS public.handoff_idempotency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key UUID NOT NULL UNIQUE,
    opportunity_id UUID NOT NULL,
    project_id UUID,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_idempotency_key ON public.handoff_idempotency(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_opportunity ON public.handoff_idempotency(opportunity_id);

-- RLS
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

-- 2. Update RPC function to support idempotency
CREATE OR REPLACE FUNCTION public.convert_opportunity_to_project_v2(
    p_opportunity_id UUID,
    p_analyst_email TEXT DEFAULT 'giulliano@revhackers.com',
    p_idempotency_key UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    v_opp RECORD;
    v_project_id UUID;
    v_quarter TEXT;
    v_project_duration TEXT;
    v_sprint_duration INT;
    v_num_sprints INT;
    v_sprint_start_date DATE;
    v_sprint_id UUID;
    v_result JSONB;
    v_handoff_duration_hours NUMERIC;
    v_existing_idempotency RECORD;
BEGIN
    -- Check idempotency if key provided
    IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO v_existing_idempotency
        FROM handoff_idempotency
        WHERE idempotency_key = p_idempotency_key;
        
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'project_id', v_existing_idempotency.project_id,
                'message', 'Already processed (idempotent)',
                'already_processed', true
            );
        END IF;
    END IF;

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
        -- Record idempotency if key provided
        IF p_idempotency_key IS NOT NULL THEN
            INSERT INTO handoff_idempotency (idempotency_key, opportunity_id, project_id, result)
            VALUES (p_idempotency_key, p_opportunity_id, v_opp.rei_project_id, jsonb_build_object('message', 'Already converted'))
            ON CONFLICT (idempotency_key) DO NOTHING;
        END IF;
        
        RETURN jsonb_build_object(
            'success', true,
            'project_id', v_opp.rei_project_id,
            'message', 'Project already exists',
            'already_converted', true
        );
    END IF;

    -- 2. Calculate quarter
    v_quarter := 'Q' || CEIL(EXTRACT(MONTH FROM now()) / 3.0)::INT;

    -- 3. Determine project duration (from opportunity_data or default to 90)
    v_project_duration := COALESCE(
        (v_opp.opportunity_data->>'project_duration')::TEXT,
        '90'
    );

    -- 4. Calculate sprint configuration
    CASE
        WHEN v_project_duration::INT <= 30 THEN
            v_sprint_duration := 7;
            v_num_sprints := 4;
        WHEN v_project_duration::INT <= 60 THEN
            v_sprint_duration := 14;
            v_num_sprints := 4;
        WHEN v_project_duration::INT <= 90 THEN
            v_sprint_duration := 21;
            v_num_sprints := 4;
        ELSE
            v_sprint_duration := 30;
            v_num_sprints := CEIL(v_project_duration::INT / 30.0)::INT;
    END CASE;

    -- 5. Create the rei_project (execution entity)
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
        next_rei_date,
        project_duration
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
        now() + INTERVAL '7 days',
        v_project_duration
    )
    RETURNING id INTO v_project_id;

    -- 6. Create sprints
    v_sprint_start_date := (now() + INTERVAL '7 days')::DATE;

    FOR i IN 1..v_num_sprints LOOP
        INSERT INTO public.orqflow_sprints (
            project_id,
            name,
            start_date,
            end_date,
            status
        ) VALUES (
            v_project_id,
            'Sprint ' || LPAD(i::TEXT, 2, '0'),
            v_sprint_start_date,
            v_sprint_start_date + make_interval(days => v_sprint_duration),
            CASE WHEN i = 1 THEN 'planned' ELSE 'planned' END
        )
        RETURNING id INTO v_sprint_id;

        v_sprint_start_date := v_sprint_start_date + make_interval(days => v_sprint_duration);
    END LOOP;

    -- 7. Link project back to opportunity
    UPDATE public.opportunities
    SET
        rei_project_id = v_project_id,
        pipeline_stage = 'won',
        won_at = COALESCE(v_opp.won_at, now()),
        updated_at = now()
    WHERE id = p_opportunity_id;

    -- 8. Record stage history
    INSERT INTO public.opportunity_stage_history (opportunity_id, from_stage, to_stage, notes)
    VALUES (p_opportunity_id, v_opp.pipeline_stage, 'won', 'Convertido para projeto automaticamente - ID: ' || v_project_id);

    INSERT INTO public.pipeline_stage_history (rei_project_id, from_stage, to_stage, notes)
    VALUES (v_project_id, NULL, 'onboarding', 'Projeto criado automaticamente a partir da oportunidade ' || p_opportunity_id);

    -- 9. Calculate handoff SLA
    v_handoff_duration_hours := EXTRACT(EPOCH FROM (now() - v_opp.won_at)) / 3600;

    -- 10. Log handoff metrics
    INSERT INTO public.handoff_metrics (
        opportunity_id,
        project_id,
        started_at,
        completed_at,
        duration_hours,
        sla_met,
        validation_passed
    ) VALUES (
        p_opportunity_id,
        v_project_id,
        v_opp.won_at,
        now(),
        v_handoff_duration_hours,
        v_handoff_duration_hours <= 24,
        true
    );

    -- 11. Record idempotency if key provided
    IF p_idempotency_key IS NOT NULL THEN
        INSERT INTO handoff_idempotency (idempotency_key, opportunity_id, project_id, result)
        VALUES (p_idempotency_key, p_opportunity_id, v_project_id, jsonb_build_object('message', 'Success'))
        ON CONFLICT (idempotency_key) DO NOTHING;
    END IF;

    -- 12. Build result
    v_result := jsonb_build_object(
        'success', true,
        'project_id', v_project_id,
        'opportunity_id', p_opportunity_id,
        'sprints_created', v_num_sprints,
        'handoff_duration_hours', v_handoff_duration_hours,
        'sla_met', v_handoff_duration_hours <= 24,
        'message', 'Project created successfully with ' || v_num_sprints || ' sprints'
    );

    RETURN v_result;
END;
$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.convert_opportunity_to_project_v2 TO service_role;

-- 4. Comments
COMMENT ON TABLE public.handoff_idempotency IS 'Tracks idempotency keys to prevent duplicate processing';
COMMENT ON FUNCTION public.convert_opportunity_to_project_v2 IS 'Enhanced handoff function with idempotency support';
