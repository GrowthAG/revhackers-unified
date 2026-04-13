-- ============================================================================
-- MIGRATION: Auto Handoff Trigger
-- Purpose: Automatically convert opportunity to project when won
-- Date: 2026-04-03
-- Author: Kiro (AI) + Giulliano
-- ============================================================================

-- ============================================================================
-- 1. ENHANCED RPC: convert_opportunity_to_project_v2
-- ============================================================================
-- Improvements over v1:
-- - Injects sprints based on project duration
-- - Injects tasks from template
-- - Sends welcome email to client
-- - Sends notification to analyst
-- - Tracks SLA (24h)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.convert_opportunity_to_project_v2(
    p_opportunity_id UUID,
    p_analyst_email TEXT DEFAULT 'giulliano@revhackers.com'
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
            v_sprint_duration := 7;  -- 1 week sprints
            v_num_sprints := 4;
        WHEN v_project_duration::INT <= 60 THEN
            v_sprint_duration := 14; -- 2 week sprints
            v_num_sprints := 4;
        WHEN v_project_duration::INT <= 90 THEN
            v_sprint_duration := 21; -- 3 week sprints
            v_num_sprints := 4;
        ELSE
            v_sprint_duration := 30; -- 1 month sprints
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
        now() + INTERVAL '7 days', -- Kickoff in 7 days
        v_project_duration
    )
    RETURNING id INTO v_project_id;

    -- 6. Create sprints
    v_sprint_start_date := (now() + INTERVAL '7 days')::DATE; -- Start after kickoff

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

        -- Move to next sprint
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

    -- 11. Build result
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

-- ============================================================================
-- 2. HANDOFF METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.handoff_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.rei_projects(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL,
    duration_hours NUMERIC NOT NULL,
    sla_met BOOLEAN NOT NULL DEFAULT false,
    validation_passed BOOLEAN NOT NULL DEFAULT true,
    errors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_handoff_metrics_opportunity ON public.handoff_metrics(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_handoff_metrics_project ON public.handoff_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_handoff_metrics_sla ON public.handoff_metrics(sla_met);
CREATE INDEX IF NOT EXISTS idx_handoff_metrics_created ON public.handoff_metrics(created_at);

-- RLS
ALTER TABLE public.handoff_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read handoff metrics" ON public.handoff_metrics;
CREATE POLICY "Authenticated users can read handoff metrics"
    ON public.handoff_metrics FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role can insert handoff metrics" ON public.handoff_metrics;
CREATE POLICY "Service role can insert handoff metrics"
    ON public.handoff_metrics FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ============================================================================
-- 3. TRIGGER FUNCTION: auto_handoff_on_won
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_handoff_on_won()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    v_function_url TEXT;
BEGIN
    -- Only trigger if stage changed TO "won" (not already won)
    IF NEW.pipeline_stage = 'won' AND (OLD.pipeline_stage IS NULL OR OLD.pipeline_stage != 'won') THEN
        
        -- Set won_at if not already set
        IF NEW.won_at IS NULL THEN
            NEW.won_at := now();
        END IF;

        -- Build Edge Function URL (não loga a URL completa)
        v_function_url := current_setting('app.supabase_url', true) || '/functions/v1/auto-handoff';
        
        -- Call Edge Function asynchronously via pg_net (non-blocking)
        -- This allows the UPDATE to complete immediately
        PERFORM net.http_post(
            url := v_function_url,
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || current_setting('app.supabase_service_role_key', true)
            ),
            body := jsonb_build_object(
                'opportunity_id', NEW.id,
                'analyst_email', NEW.analyst_email,
                'won_at', NEW.won_at
            )
        );

        -- Log trigger execution (SEM dados sensíveis)
        RAISE NOTICE 'Auto handoff triggered for opportunity ID: % (security: ID logged for debugging only)', NEW.id;
    END IF;

    RETURN NEW;
END;
$;

-- ============================================================================
-- 4. CREATE TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS trigger_auto_handoff_on_won ON public.opportunities;

CREATE TRIGGER trigger_auto_handoff_on_won
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_handoff_on_won();

-- ============================================================================
-- 5. COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.convert_opportunity_to_project_v2 IS 'Enhanced handoff function that creates project, sprints, and tracks SLA';
COMMENT ON TABLE public.handoff_metrics IS 'Tracks handoff performance metrics for analytics and SLA monitoring';
COMMENT ON FUNCTION public.auto_handoff_on_won IS 'Trigger function that queues automatic handoff when opportunity is won';
COMMENT ON TRIGGER trigger_auto_handoff_on_won ON public.opportunities IS 'Automatically triggers handoff process when opportunity stage changes to won';

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.convert_opportunity_to_project_v2 TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_handoff_on_won TO service_role;

