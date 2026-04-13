-- ============================================================================
-- MIGRATION: Rate Limit Cooldown
-- Purpose: Prevent trigger spamming by adding cooldown
-- Date: 2026-04-03
-- ============================================================================

-- 1. Create cooldown table
CREATE TABLE IF NOT EXISTS public.handoff_rate_limit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL,
    last_triggered TIMESTAMPTZ NOT NULL DEFAULT now(),
    cooldown_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_opportunity ON public.handoff_rate_limit(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_cooldown ON public.handoff_rate_limit(cooldown_until);

-- RLS
ALTER TABLE public.handoff_rate_limit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read rate limit" ON public.handoff_rate_limit;
CREATE POLICY "Authenticated users can read rate limit"
    ON public.handoff_rate_limit FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role can insert rate limit" ON public.handoff_rate_limit;
CREATE POLICY "Service role can insert rate limit"
    ON public.handoff_rate_limit FOR INSERT
    TO service_role
    WITH CHECK (true);

-- 2. Update trigger function with cooldown check
CREATE OR REPLACE FUNCTION public.auto_handoff_on_won()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $
DECLARE
    v_cooldown RECORD;
    v_cooldown_minutes INT := 5; -- 5 minutes cooldown
BEGIN
    -- Only trigger if stage changed TO "won" (not already won)
    IF NEW.pipeline_stage = 'won' AND (OLD.pipeline_stage IS NULL OR OLD.pipeline_stage != 'won') THEN
        
        -- Check cooldown
        SELECT * INTO v_cooldown
        FROM handoff_rate_limit
        WHERE opportunity_id = NEW.id
        AND cooldown_until > now();
        
        IF FOUND THEN
            RAISE NOTICE 'Auto handoff skipped (cooldown active for opportunity %)', NEW.id;
            RETURN NEW;
        END IF;

        -- Set won_at if not already set
        IF NEW.won_at IS NULL THEN
            NEW.won_at := now();
        END IF;

        -- Insert cooldown record
        INSERT INTO handoff_rate_limit (opportunity_id, cooldown_until)
        VALUES (NEW.id, now() + make_interval(mins => v_cooldown_minutes))
        ON CONFLICT (opportunity_id) DO UPDATE
        SET cooldown_until = now() + make_interval(mins => v_cooldown_minutes);

        -- Build Edge Function URL
        PERFORM net.http_post(
            url := current_setting('app.supabase_url', true) || '/functions/v1/auto-handoff',
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

        -- Log trigger execution
        RAISE NOTICE 'Auto handoff triggered for opportunity ID: %', NEW.id;
    END IF;

    RETURN NEW;
END;
$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.auto_handoff_on_won TO service_role;

-- 4. Comments
COMMENT ON TABLE public.handoff_rate_limit IS 'Tracks rate limiting for handoff triggers to prevent spam';
COMMENT ON FUNCTION public.auto_handoff_on_won IS 'Trigger function with cooldown to prevent spam';
