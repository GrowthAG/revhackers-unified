-- R1 do backlog de roteamento de IA (docs/PLANO-MESTRE.md, Frente 2).
-- Registra cada chamada a um provider de IA (Claude/OpenAI) feita pelas Edge
-- Functions, para dar visibilidade de uso antes de existir orcamento (R2) ou
-- roteador por custo (R3). Custo estimado fica fora de escopo aqui de proposito:
-- nao ha tabela de precificacao por modelo ainda, e nenhum valor de custo deve
-- ser inventado (regra anti-alucinacao do projeto).

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    edge_function TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms INTEGER,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_log_created_at ON public.ai_usage_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_provider_model ON public.ai_usage_log (provider, model);
CREATE INDEX IF NOT EXISTS idx_ai_usage_log_edge_function ON public.ai_usage_log (edge_function);

ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;

-- Mesmo padrao de supabase/migrations/20260417000005_create_audit_logs.sql:
-- so o service_role (Edge Functions) grava, usuarios autenticados so leem.
-- Nenhuma policy para anon.
DROP POLICY IF EXISTS "Service role can manage ai_usage_log" ON public.ai_usage_log;
CREATE POLICY "Service role can manage ai_usage_log"
    ON public.ai_usage_log FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read ai_usage_log" ON public.ai_usage_log;
CREATE POLICY "Authenticated can read ai_usage_log"
    ON public.ai_usage_log FOR SELECT
    TO authenticated
    USING (true);
