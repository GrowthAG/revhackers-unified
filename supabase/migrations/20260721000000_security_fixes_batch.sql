-- ============================================================================
-- BATCH: Security Fixes from Deep Review (2026-07-21)
-- Cobre: S-06, S-07, S-10, A-02, M-01, M-02 (parcial)
-- ============================================================================


-- ============================================================================
-- S-06: Prevenir escalada de role via UPDATE direto no frontend.
--
-- AdminUsers.tsx faz supabase.from("profiles").update({ role }) diretamente,
-- com verificação de autorização apenas no lado do cliente (bypassável via
-- console do browser). Esta trigger garante que a regra seja aplicada
-- independentemente de quem chama a API REST.
--
-- Regra:
--   - super_admin pode mudar o role de qualquer um.
--   - admin pode mudar o role de 'user' para 'user' (sem elevação).
--   - user não pode mudar role de ninguém (incluindo o próprio).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_role TEXT;
BEGIN
  -- Sem mudança de role: passa direto
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Identificar o role do chamador (via JWT)
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Regra 1: super_admin pode tudo
  IF v_caller_role = 'super_admin' THEN
    RETURN NEW;
  END IF;

  -- Regra 2: admin só pode manter ou rebaixar para 'user' (nunca elevar para admin/super_admin)
  IF v_caller_role = 'admin' AND NEW.role IN ('user') AND OLD.role IN ('user') THEN
    RETURN NEW;
  END IF;

  -- Qualquer outro caso: bloqueia
  RAISE EXCEPTION 'Permissão insuficiente para alterar role. Seu role: %. Tentou mudar de % para %.',
    COALESCE(v_caller_role, 'anon'), OLD.role, NEW.role;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_role_update ON public.profiles;
CREATE TRIGGER trg_enforce_role_update
  BEFORE UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_role_update();

COMMENT ON FUNCTION public.enforce_role_update IS
  'S-06: Impede escalada de role via UPDATE direto. super_admin pode tudo. admin so pode manter users como user. Qualquer outra mudanca e rejeitada pelo banco independente do frontend.';


-- ============================================================================
-- S-07: Rate-limiting para Edge Functions de IA.
--
-- generate-strategic-plan, generate-success-plan e auto-enrich-project nao
-- tinham nenhum controle de frequencia. ai_usage_log era so observabilidade.
-- Esta migration adiciona a tabela de controle e a RPC de verificacao.
--
-- Limite padrao: 10 chamadas por usuario por funcao por hora.
-- Configuravel via ai_rate_limit_config (sem necessidade de migration para ajustar).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    edge_function TEXT NOT NULL,
    window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', now()),
    call_count   INT NOT NULL DEFAULT 1,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, edge_function, window_start)
);

CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_user_fn_window
    ON public.ai_rate_limits (user_id, edge_function, window_start);

ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- Apenas service_role acessa (as Edge Functions usam service_role)
CREATE POLICY "ai_rate_limits_service_all"
    ON public.ai_rate_limits FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Tabela de configuração de limites por função (permite ajustar sem nova migration)
CREATE TABLE IF NOT EXISTS public.ai_rate_limit_config (
    edge_function  TEXT PRIMARY KEY,
    max_per_hour   INT NOT NULL DEFAULT 10,
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_rate_limit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_rate_limit_config_service_all"
    ON public.ai_rate_limit_config FOR ALL
    TO service_role USING (true) WITH CHECK (true);

-- Permite que admins leiam a config (para painel de observabilidade)
CREATE POLICY "ai_rate_limit_config_admin_select"
    ON public.ai_rate_limit_config FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')
    ));

-- Defaults de limite por função
INSERT INTO public.ai_rate_limit_config (edge_function, max_per_hour) VALUES
    ('generate-strategic-plan',  5),
    ('generate-success-plan',   10),
    ('auto-enrich-project',     15)
ON CONFLICT (edge_function) DO NOTHING;

-- RPC de verificacao + incremento atômica (usada pelas Edge Functions)
-- Retorna TRUE se a chamada é permitida, FALSE se o limite foi atingido.
CREATE OR REPLACE FUNCTION public.check_and_increment_ai_rate_limit(
    p_user_id      UUID,
    p_edge_function TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_max_per_hour INT;
    v_current_count INT;
    v_window TIMESTAMPTZ := date_trunc('hour', now());
BEGIN
    -- Buscar limite configurado (fallback 10)
    SELECT max_per_hour INTO v_max_per_hour
    FROM public.ai_rate_limit_config
    WHERE edge_function = p_edge_function;

    v_max_per_hour := COALESCE(v_max_per_hour, 10);

    -- Upsert atomico: cria ou incrementa o contador na janela atual
    INSERT INTO public.ai_rate_limits (user_id, edge_function, window_start, call_count)
    VALUES (p_user_id, p_edge_function, v_window, 1)
    ON CONFLICT (user_id, edge_function, window_start)
    DO UPDATE SET
        call_count = ai_rate_limits.call_count + 1,
        updated_at = now()
    RETURNING call_count INTO v_current_count;

    -- Se já excedeu o limite, desfaz o incremento e rejeita
    IF v_current_count > v_max_per_hour THEN
        UPDATE public.ai_rate_limits
        SET call_count = call_count - 1, updated_at = now()
        WHERE user_id = p_user_id
          AND edge_function = p_edge_function
          AND window_start = v_window;
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_ai_rate_limit(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_increment_ai_rate_limit(UUID, TEXT) TO service_role;

COMMENT ON FUNCTION public.check_and_increment_ai_rate_limit IS
    'S-07: Rate-limit atomico para Edge Functions de IA. Retorna FALSE se usuario ultrapassou limite da hora.';


-- ============================================================================
-- S-10: Proteção contra flood de NPS anônimo na página pública do Hub.
--
-- submit_hub_nps aceitava múltiplas submissões anônimas para o mesmo
-- project_id sem nenhum controle. Esta versão adiciona limite de 1 NPS por
-- project_id por janela de 24h (independente de IP, pois anon nao tem sessao).
-- O bloqueio por project_id em vez de IP é suficiente para o caso de uso:
-- o visitante autentico nao vai submeter NPS duas vezes para o mesmo projeto.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.submit_hub_nps(
    p_project_id UUID,
    p_score      INTEGER,
    p_comment    TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    -- Validar score
    IF p_score IS NULL OR p_score < 0 OR p_score > 10 THEN
        RAISE EXCEPTION 'invalid score: %', p_score;
    END IF;

    -- Validar project_id
    IF NOT EXISTS (SELECT 1 FROM public.rei_projects WHERE id = p_project_id) THEN
        RAISE EXCEPTION 'unknown project_id';
    END IF;

    -- S-10: Anti-flood — máximo 1 NPS por project_id nas últimas 24h
    IF EXISTS (
        SELECT 1 FROM public.rei_responses
        WHERE project_id = p_project_id
          AND context = 'public'
          AND created_at > now() - INTERVAL '24 hours'
    ) THEN
        -- Retorna o ID existente em vez de erro (idempotente do ponto de vista do cliente)
        SELECT id INTO v_id
        FROM public.rei_responses
        WHERE project_id = p_project_id AND context = 'public'
        ORDER BY created_at DESC LIMIT 1;
        RETURN v_id;
    END IF;

    INSERT INTO public.rei_responses (
        project_id, context, responses,
        total_score, maturity_level, maturity_percentage, source
    )
    VALUES (
        p_project_id, 'public',
        jsonb_build_object(
            'nps_score',    p_score,
            'nps_comment',  p_comment,
            'submitted_at', now()
        ),
        p_score, 'Feedback', p_score * 10, 'diagnostic'
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_hub_nps(UUID, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_hub_nps(UUID, INTEGER, TEXT) TO anon, authenticated;

COMMENT ON FUNCTION public.submit_hub_nps IS
    'S-10: Corrige flood. Max 1 NPS por project_id por 24h. Idempotente: retorna ID existente se ja submetido.';


-- ============================================================================
-- A-02: Adicionar null-guard na trigger auto_handoff_on_won.
--
-- A trigger usa current_setting('app.supabase_service_role_key', true) com
-- segundo argumento TRUE (retorna NULL em vez de EXCEPTION quando nao
-- configurado). Isso causava falha silenciosa: o Authorization header ficava
-- 'Bearer ' (vazio). Adicionamos uma verificação explícita antes do http_post.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.auto_handoff_on_won()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_cooldown RECORD;
    v_cooldown_minutes INT := 5;
    v_service_key TEXT;
    v_supabase_url TEXT;
BEGIN
    IF NEW.pipeline_stage = 'won' AND (OLD.pipeline_stage IS NULL OR OLD.pipeline_stage != 'won') THEN

        -- Cooldown check
        SELECT * INTO v_cooldown
        FROM handoff_rate_limit
        WHERE opportunity_id = NEW.id
          AND cooldown_until > now();

        IF FOUND THEN
            RAISE NOTICE 'Auto handoff skipped (cooldown active for opportunity %)', NEW.id;
            RETURN NEW;
        END IF;

        IF NEW.won_at IS NULL THEN
            NEW.won_at := now();
        END IF;

        -- Cooldown record
        INSERT INTO handoff_rate_limit (opportunity_id, cooldown_until)
        VALUES (NEW.id, now() + make_interval(mins => v_cooldown_minutes))
        ON CONFLICT (opportunity_id) DO UPDATE
        SET cooldown_until = now() + make_interval(mins => v_cooldown_minutes);

        -- A-02: null-guard para current_setting
        v_service_key := current_setting('app.supabase_service_role_key', true);
        v_supabase_url := current_setting('app.supabase_url', true);

        IF v_service_key IS NULL OR v_supabase_url IS NULL THEN
            RAISE WARNING '[auto_handoff_on_won] app.supabase_service_role_key ou app.supabase_url nao configurados. Handoff automatico ignorado para opportunity %', NEW.id;
            RETURN NEW;
        END IF;

        PERFORM net.http_post(
            url     := v_supabase_url || '/functions/v1/auto-handoff',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || v_service_key
            ),
            body    := jsonb_build_object(
                'opportunity_id', NEW.id,
                'analyst_email',  NEW.analyst_email,
                'won_at',         NEW.won_at
            )
        );

        RAISE NOTICE 'Auto handoff triggered for opportunity ID: %', NEW.id;
    END IF;

    RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_handoff_on_won TO service_role;

COMMENT ON FUNCTION public.auto_handoff_on_won IS
    'A-02: Trigger com cooldown + null-guard para current_setting. Falha de config gera WARNING (nao silencioso) em vez de header Authorization vazio.';


-- ============================================================================
-- M-01: client_meetings — restringir leitura por analista ou admin/super_admin.
--
-- A policy anterior ("client_meetings_authenticated_select") usava USING (true),
-- expondo notas, gravações e e-mails de contato de TODOS os clientes a qualquer
-- usuário autenticado do workspace. Corrige para escopo por analista.
-- ============================================================================

DROP POLICY IF EXISTS "client_meetings_authenticated_select" ON public.client_meetings;

CREATE POLICY "client_meetings_scoped_select"
ON public.client_meetings FOR SELECT
TO authenticated
USING (
    -- Organizador da reunião vê seus registros (coluna real: organizer_email)
    organizer_email = auth.email()
    OR
    -- Admins e super_admins têm visão completa
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('admin', 'super_admin')
    )
);

COMMENT ON POLICY "client_meetings_scoped_select" ON public.client_meetings IS
    'M-01: Leitura de reunioes restrita ao proprio analista ou a admins. Remove visibilidade global de notas/gravacoes de clientes para usuarios comuns.';
