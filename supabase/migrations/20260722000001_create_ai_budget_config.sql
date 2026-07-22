-- R2 do backlog de roteamento de IA (docs/PLANO-MESTRE.md, Frente 2).
-- Guarda o orcamento mensal por provider de IA e o gasto acumulado do ciclo,
-- para que o roteador por custo (R3) possa decidir provider/modelo com base em
-- orcamento restante em vez de ordem fixa de fallback.
--
-- IMPORTANTE (regra anti-alucinacao do projeto): nenhum valor de limite e
-- inventado aqui. As linhas seed nascem com monthly_limit_usd = NULL
-- (orcamento "indefinido"), e cabe a Giulliano definir o numero real depois
-- (decisao R5, ainda pendente). Enquanto o limite for NULL, o roteador deve
-- tratar como "sem teto configurado", nunca como zero.

CREATE TABLE IF NOT EXISTS public.ai_budget_config (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider           TEXT NOT NULL,
    -- Limite mensal em USD. NULL = nao configurado (sem teto). Nunca inventar.
    monthly_limit_usd  NUMERIC,
    -- Gasto acumulado no ciclo corrente, atualizado por processo externo/R6.
    current_spend_usd  NUMERIC NOT NULL DEFAULT 0,
    -- Fracao do limite (0-1) que dispara alerta. Ex: 0.8 = alerta em 80%.
    alert_threshold    NUMERIC NOT NULL DEFAULT 0.8,
    -- Primeiro dia do ciclo de faturamento vigente (para reset mensal).
    cycle_started_at   DATE NOT NULL DEFAULT date_trunc('month', now())::date,
    is_active          BOOLEAN NOT NULL DEFAULT true,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ai_budget_config_provider_unique UNIQUE (provider),
    CONSTRAINT ai_budget_config_threshold_range CHECK (alert_threshold >= 0 AND alert_threshold <= 1),
    CONSTRAINT ai_budget_config_limit_nonneg CHECK (monthly_limit_usd IS NULL OR monthly_limit_usd >= 0),
    CONSTRAINT ai_budget_config_spend_nonneg CHECK (current_spend_usd >= 0)
);

CREATE INDEX IF NOT EXISTS idx_ai_budget_config_provider ON public.ai_budget_config (provider);

ALTER TABLE public.ai_budget_config ENABLE ROW LEVEL SECURITY;

-- Mesmo padrao de 20260717000002_create_ai_usage_log.sql:
-- so o service_role (Edge Functions / processos internos) escreve,
-- usuarios autenticados so leem. Nenhuma policy para anon.
DROP POLICY IF EXISTS "Service role can manage ai_budget_config" ON public.ai_budget_config;
CREATE POLICY "Service role can manage ai_budget_config"
    ON public.ai_budget_config FOR ALL
    TO service_role
    USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read ai_budget_config" ON public.ai_budget_config;
CREATE POLICY "Authenticated can read ai_budget_config"
    ON public.ai_budget_config FOR SELECT
    TO authenticated
    USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_ai_budget_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ai_budget_config_updated_at ON public.ai_budget_config;
CREATE TRIGGER trg_ai_budget_config_updated_at
BEFORE UPDATE ON public.ai_budget_config
FOR EACH ROW EXECUTE FUNCTION public.set_ai_budget_config_updated_at();

-- Seed dos dois providers em uso hoje (anthropic, openai), com limite NAO
-- configurado (NULL). Idempotente: nao sobrescreve se ja existir.
INSERT INTO public.ai_budget_config (provider, monthly_limit_usd)
VALUES ('anthropic', NULL), ('openai', NULL)
ON CONFLICT (provider) DO NOTHING;

COMMENT ON TABLE public.ai_budget_config IS
'R2: orcamento mensal por provider de IA. monthly_limit_usd NULL = sem teto configurado (nunca inventar valor). Alimenta o roteador por custo (R3).';
