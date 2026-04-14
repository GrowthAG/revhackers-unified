-- ============================================================================
-- MIGRATION: Won Deals Reconciliation Safety Net
-- Purpose: Detect and alert on deals marked as 'won' that never got converted
--          to a project. This is the most critical silent failure in the chain.
-- Date: 2026-04-14
-- ============================================================================

-- 1. View para reconciliação: deals won sem projeto
CREATE OR REPLACE VIEW public.v_orphaned_won_deals AS
SELECT
    o.id AS opportunity_id,
    o.client_name,
    o.client_email,
    o.client_company,
    o.pipeline_stage,
    o.won_at,
    o.updated_at,
    o.rei_project_id,
    ROUND(EXTRACT(EPOCH FROM (now() - o.won_at)) / 3600, 1) AS hours_since_won,
    CASE
        WHEN o.rei_project_id IS NULL AND o.won_at < now() - interval '5 minutes' THEN 'ORPHANED'
        WHEN o.rei_project_id IS NOT NULL THEN 'OK'
        ELSE 'PENDING'
    END AS reconciliation_status
FROM public.opportunities o
WHERE o.pipeline_stage = 'won'
ORDER BY o.won_at DESC;

COMMENT ON VIEW public.v_orphaned_won_deals IS 
'Safety net view: detects opportunities marked as won that were never converted to a project. Query WHERE reconciliation_status = ORPHANED to find gaps.';

-- 2. RPC para reconciliação manual: tenta converter deals órfãos
CREATE OR REPLACE FUNCTION public.reconcile_orphaned_won_deals()
RETURNS TABLE (
    opportunity_id UUID,
    client_name TEXT,
    hours_since_won NUMERIC,
    action_taken TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rec RECORD;
    v_result JSONB;
BEGIN
    FOR rec IN
        SELECT o.id, o.client_name, o.won_at
        FROM public.opportunities o
        WHERE o.pipeline_stage = 'won'
          AND o.rei_project_id IS NULL
          AND o.won_at < now() - interval '5 minutes'
        ORDER BY o.won_at ASC
        LIMIT 10  -- processa até 10 por vez para evitar timeout
    LOOP
        BEGIN
            -- Tenta converter usando v2 (idempotente)
            SELECT public.convert_opportunity_to_project_v2(
                p_opportunity_id := rec.id
            ) INTO v_result;

            opportunity_id := rec.id;
            client_name := rec.client_name;
            hours_since_won := ROUND(EXTRACT(EPOCH FROM (now() - rec.won_at)) / 3600, 1);
            action_taken := CASE 
                WHEN (v_result->>'success')::boolean THEN 'CONVERTED: ' || (v_result->>'project_id')
                ELSE 'FAILED: ' || COALESCE(v_result->>'message', 'unknown')
            END;
            RETURN NEXT;
        EXCEPTION WHEN OTHERS THEN
            opportunity_id := rec.id;
            client_name := rec.client_name;
            hours_since_won := ROUND(EXTRACT(EPOCH FROM (now() - rec.won_at)) / 3600, 1);
            action_taken := 'ERROR: ' || SQLERRM;
            RETURN NEXT;
        END;
    END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reconcile_orphaned_won_deals TO service_role;
COMMENT ON FUNCTION public.reconcile_orphaned_won_deals IS 
'Safety net: attempts to convert orphaned won deals (won but no project created). Runs v2 RPC with idempotency. Safe for cron or manual execution.';

-- 3. Grant select on the view to authenticated users (admin dashboard)
GRANT SELECT ON public.v_orphaned_won_deals TO authenticated;
GRANT SELECT ON public.v_orphaned_won_deals TO service_role;
