-- ============================================================================
-- BATCH 2: Security Fixes — A-01, S-11, M-02 (2026-07-21)
-- ============================================================================


-- ============================================================================
-- A-01: handoff_idempotency — mudar idempotency_key de UUID para TEXT.
--
-- O Edge Function ghl-webhook-handoff gera a chave como SHA-256 hex
-- formatado como UUID (8-4-4-4-12). Isso é um UUID-like, não um UUID
-- padrão: os bits de version/variant não são setados, o PostgreSQL aceita
-- por ser sintacticamente válido, mas é tecnicamente incorreto.
--
-- A solução mais limpa é mudar o tipo da coluna para TEXT (que é o tipo
-- real do dado) e atualizar as assinaturas das funções dependentes.
-- Nenhuma linha existente precisa ser convertida (TEXT recebe UUID strings).
-- ============================================================================

ALTER TABLE public.handoff_idempotency
    ALTER COLUMN idempotency_key TYPE TEXT;

-- A function signature também aceita UUID para compat com chamadas antigas —
-- recriar com TEXT para consistência com a tabela.
-- (A versão com DEFAULT NULL já existe como convert_opportunity_to_project_v2)
-- Versão atualizada da assinatura com TEXT:
CREATE OR REPLACE FUNCTION public.convert_opportunity_to_project_v2(
    p_opportunity_id       UUID,
    p_analyst_email        TEXT DEFAULT 'giulliano@revhackers.com.br',
    p_idempotency_key      TEXT DEFAULT NULL,
    p_mrr                  NUMERIC DEFAULT NULL,
    p_tcv                  NUMERIC DEFAULT NULL,
    p_contract_duration_months INT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    -- Check idempotency if key provided (agora TEXT, sem restrição de formato UUID)
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

    -- 3. Determine project duration
    v_project_duration := COALESCE(
        (v_opp.opportunity_data->>'project_duration')::TEXT,
        '90'
    );

    -- 4. Sprint configuration
    CASE
        WHEN v_project_duration::INT <= 30 THEN v_sprint_duration := 7;  v_num_sprints := 4;
        WHEN v_project_duration::INT <= 60 THEN v_sprint_duration := 14; v_num_sprints := 4;
        WHEN v_project_duration::INT <= 90 THEN v_sprint_duration := 21; v_num_sprints := 4;
        ELSE v_sprint_duration := 30; v_num_sprints := CEIL(v_project_duration::INT / 30.0)::INT;
    END CASE;

    -- 5. Create the rei_project
    INSERT INTO public.rei_projects (
        client_id, client_name, client_email, client_company, client_site, trade_name,
        type, lead_source, analyst_email, quarter, year, status, pipeline_stage,
        diagnostico_id, opportunity_data, enrichment_data, organization_id,
        next_rei_date, project_duration
    ) VALUES (
        v_opp.client_id, v_opp.client_name,
        COALESCE(v_opp.client_email, 'nao-informado@revhackers.com.br'),
        v_opp.client_company, v_opp.client_site, v_opp.trade_name,
        COALESCE(v_opp.type, 'consulting'), v_opp.lead_source,
        COALESCE(p_analyst_email, 'giulliano@revhackers.com.br'),
        v_quarter, EXTRACT(YEAR FROM now())::INT,
        'preparation', 'onboarding',
        v_opp.diagnostico_id,
        COALESCE(v_opp.opportunity_data, '{}'::jsonb),
        v_opp.enrichment_data, v_opp.organization_id,
        now() + INTERVAL '7 days', v_project_duration
    )
    RETURNING id INTO v_project_id;

    -- 6. Create sprints
    v_sprint_start_date := (now() + INTERVAL '7 days')::DATE;
    FOR i IN 1..v_num_sprints LOOP
        INSERT INTO public.orqflow_sprints (project_id, name, start_date, end_date, status)
        VALUES (
            v_project_id, 'Sprint ' || LPAD(i::TEXT, 2, '0'),
            v_sprint_start_date,
            v_sprint_start_date + make_interval(days => v_sprint_duration),
            'planned'
        )
        RETURNING id INTO v_sprint_id;
        v_sprint_start_date := v_sprint_start_date + make_interval(days => v_sprint_duration);
    END LOOP;

    -- 7. Link back to opportunity
    UPDATE public.opportunities
    SET rei_project_id = v_project_id, pipeline_stage = 'won',
        won_at = COALESCE(v_opp.won_at, now()), updated_at = now()
    WHERE id = p_opportunity_id;

    -- 8. Stage history
    INSERT INTO public.opportunity_stage_history (opportunity_id, from_stage, to_stage, notes)
    VALUES (p_opportunity_id, v_opp.pipeline_stage, 'won', 'Convertido para projeto automaticamente - ID: ' || v_project_id);

    INSERT INTO public.pipeline_stage_history (rei_project_id, from_stage, to_stage, notes)
    VALUES (v_project_id, NULL, 'onboarding', 'Projeto criado automaticamente a partir da oportunidade ' || p_opportunity_id);

    -- 9. Handoff SLA
    v_handoff_duration_hours := EXTRACT(EPOCH FROM (now() - v_opp.won_at)) / 3600;

    -- 10. Metrics
    INSERT INTO public.handoff_metrics (
        opportunity_id, project_id, started_at, completed_at,
        duration_hours, sla_met, validation_passed
    ) VALUES (
        p_opportunity_id, v_project_id, v_opp.won_at, now(),
        v_handoff_duration_hours, v_handoff_duration_hours <= 24, true
    );

    -- 11. Idempotency record (TEXT key)
    IF p_idempotency_key IS NOT NULL THEN
        INSERT INTO handoff_idempotency (idempotency_key, opportunity_id, project_id, result)
        VALUES (p_idempotency_key, p_opportunity_id, v_project_id, jsonb_build_object('message', 'Success'))
        ON CONFLICT (idempotency_key) DO NOTHING;
    END IF;

    -- 12. Result
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
$$;

GRANT EXECUTE ON FUNCTION public.convert_opportunity_to_project_v2(UUID, TEXT, TEXT, NUMERIC, NUMERIC, INT) TO service_role;

COMMENT ON FUNCTION public.convert_opportunity_to_project_v2(UUID, TEXT, TEXT, NUMERIC, NUMERIC, INT) IS
    'A-01: idempotency_key agora TEXT (nao UUID) para aceitar hashes SHA-256 hex sem restricao de formato UUID.';


-- ============================================================================
-- S-11: get_signature_certificate — mascarar CPF/CNPJ na versão pública.
--
-- O hash SHA-256 é o mecanismo de "link secreto" do certificado — qualquer
-- pessoa que receba o link tem acesso ao CPF completo do assinante,
-- violando o princípio de minimização de dados da LGPD (Art. 6º, III).
--
-- Solução: a função pública retorna CPF/CNPJ mascarado. Criamos uma função
-- autenticada separada que retorna os dados completos (apenas para admins
-- que precisam auditar).
-- ============================================================================

-- Versão pública: CPF/CNPJ mascarado (últimos 3 dígitos visíveis)
CREATE OR REPLACE FUNCTION public.get_signature_certificate(p_hash TEXT)
RETURNS TABLE (
    id UUID,
    signer_name TEXT,
    signer_cpf_cnpj TEXT,      -- mascarado: ***.***.***-XX ou XX.XXX.XXX/XXXX-XX
    signer_email TEXT,
    signer_role TEXT,
    signer_ip TEXT,            -- mascarado: apenas os primeiros 2 octetos (LGPD)
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    document_hash TEXT,
    reference_type TEXT,
    trade_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        s.id,
        s.signer_name,
        -- Mascara CPF: mantém só os últimos 3 dígitos numéricos
        REGEXP_REPLACE(
            REGEXP_REPLACE(s.signer_cpf_cnpj, '[0-9]', '*', 'g'),
            '\*{3}$',
            SUBSTRING(REGEXP_REPLACE(s.signer_cpf_cnpj, '[^0-9]', '', 'g') FROM '.{3}$'),
            'g'
        ) AS signer_cpf_cnpj,
        s.signer_email,
        s.signer_role,
        -- Mascara IP: mantém apenas os 2 primeiros octetos (ex: 177.23.*.*)
        CASE
            WHEN s.signer_ip ~ '^\d+\.\d+\.'
            THEN REGEXP_REPLACE(s.signer_ip, '^(\d+\.\d+\.).*', '\1*.*')
            ELSE '***'
        END AS signer_ip,
        s.user_agent,
        s.signed_at,
        s.created_at,
        s.document_hash,
        s.reference_type,
        p.trade_name
    FROM public.document_signatures s
    LEFT JOIN public.rei_projects p ON p.id = s.project_id
    WHERE s.document_hash = p_hash;
$$;

REVOKE ALL ON FUNCTION public.get_signature_certificate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_signature_certificate(TEXT) TO anon, authenticated;

-- Versão auditada: dados completos, apenas para admin/super_admin autenticados
CREATE OR REPLACE FUNCTION public.get_signature_certificate_full(p_hash TEXT)
RETURNS TABLE (
    id UUID,
    signer_name TEXT,
    signer_cpf_cnpj TEXT,
    signer_email TEXT,
    signer_role TEXT,
    signer_ip TEXT,
    user_agent TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    document_hash TEXT,
    reference_type TEXT,
    trade_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
    IF v_caller_role NOT IN ('admin', 'super_admin') THEN
        RAISE EXCEPTION 'Acesso negado: apenas admin pode visualizar dados completos de assinatura';
    END IF;

    RETURN QUERY
    SELECT
        s.id, s.signer_name, s.signer_cpf_cnpj, s.signer_email, s.signer_role,
        s.signer_ip, s.user_agent, s.signed_at, s.created_at,
        s.document_hash, s.reference_type, p.trade_name
    FROM public.document_signatures s
    LEFT JOIN public.rei_projects p ON p.id = s.project_id
    WHERE s.document_hash = p_hash;
END;
$$;

REVOKE ALL ON FUNCTION public.get_signature_certificate_full(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_signature_certificate_full(TEXT) TO authenticated;

COMMENT ON FUNCTION public.get_signature_certificate IS
    'S-11 (LGPD): versao publica com CPF e IP mascarados. Para auditoria com dados completos usar get_signature_certificate_full (requer admin).';
COMMENT ON FUNCTION public.get_signature_certificate_full IS
    'S-11: versao auditada de get_signature_certificate com dados completos. Requer role admin ou super_admin.';


-- ============================================================================
-- M-02: knowledge_libraries — escopo de acesso por projeto.
--
-- A policy "knowledge_libraries_authenticated_all" usava USING (true), que
-- permitia qualquer usuário autenticado ler, editar e deletar a base de
-- conhecimento de qualquer projeto de qualquer cliente.
--
-- Correção: leitura para todos autenticados (visualização de client hub),
-- escrita (INSERT/UPDATE/DELETE) restrita ao analista do projeto ou admin.
-- ============================================================================

DROP POLICY IF EXISTS "knowledge_libraries_authenticated_all" ON public.knowledge_libraries;

-- SELECT: qualquer autenticado pode ler (necessário para o client hub público autenticado)
CREATE POLICY "knowledge_libraries_authenticated_select"
ON public.knowledge_libraries FOR SELECT
TO authenticated
USING (true);

-- INSERT: apenas analista do projeto ou admin/super_admin
CREATE POLICY "knowledge_libraries_insert_scoped"
ON public.knowledge_libraries FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.rei_projects rp
        WHERE rp.id = project_id
          AND (
              rp.analyst_email = auth.email()
              OR EXISTS (
                  SELECT 1 FROM public.profiles
                  WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
              )
          )
    )
);

-- UPDATE: mesmo escopo que INSERT
CREATE POLICY "knowledge_libraries_update_scoped"
ON public.knowledge_libraries FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.rei_projects rp
        WHERE rp.id = project_id
          AND (
              rp.analyst_email = auth.email()
              OR EXISTS (
                  SELECT 1 FROM public.profiles
                  WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
              )
          )
    )
);

-- DELETE: idem
CREATE POLICY "knowledge_libraries_delete_scoped"
ON public.knowledge_libraries FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.rei_projects rp
        WHERE rp.id = project_id
          AND (
              rp.analyst_email = auth.email()
              OR EXISTS (
                  SELECT 1 FROM public.profiles
                  WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
              )
          )
    )
);

COMMENT ON TABLE public.knowledge_libraries IS
    'M-02: Leitura: qualquer autenticado. Escrita: analista do projeto ou admin/super_admin apenas.';
