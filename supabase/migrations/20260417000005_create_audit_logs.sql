-- Fix: trigger audit_trigger em rei_projects referencia tabela audit_logs que nao existe.

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    organization_id UUID,
    table_name TEXT,
    record_id UUID,
    action TEXT,
    new_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage audit_logs" ON public.audit_logs;
CREATE POLICY "Service role can manage audit_logs"
    ON public.audit_logs FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read audit_logs" ON public.audit_logs;
CREATE POLICY "Authenticated can read audit_logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (true);
