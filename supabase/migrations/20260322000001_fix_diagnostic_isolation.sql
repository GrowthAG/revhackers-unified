-- ============================================================
-- FIX: Diagnosticos publicos NAO devem criar rei_projects com status 'active'
--
-- PROBLEMA: Cada curioso que preenche GrowthScore/FounderScore/etc cria
-- um rei_projects com status='active', poluindo a lista de projetos reais.
--
-- SOLUCAO: Marcar como source='diagnostic' e status='diagnostic' (nao 'active')
-- para que nunca aparecam em nenhuma view de projetos/leads/pipeline.
-- ============================================================

-- 1. Recriar a RPC com isolamento correto
CREATE OR REPLACE FUNCTION create_diagnostic_entry(
    p_lead_name TEXT,
    p_lead_email TEXT,
    p_lead_company TEXT,
    p_responses JSONB,
    p_score INTEGER,
    p_maturity_level TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_project_id UUID;
    v_response_id UUID;
    v_next_date TIMESTAMP WITH TIME ZONE;
    v_current_year INTEGER;
BEGIN
    v_next_date := NOW() + INTERVAL '1 year';
    v_current_year := EXTRACT(YEAR FROM NOW())::INTEGER;

    -- 1. Insert Project com status 'diagnostic' e source 'diagnostic'
    -- NUNCA usar status 'active' para quizzes publicos
    INSERT INTO public.rei_projects (
        client_name,
        client_email,
        client_company,
        analyst_email,
        next_rei_date,
        quarter,
        year,
        status,
        source
    ) VALUES (
        p_lead_name,
        p_lead_email,
        p_lead_company,
        'giulliano@revhackers.com.br',
        v_next_date,
        'Q1',
        v_current_year,
        'diagnostic',
        'diagnostic'
    ) RETURNING id INTO v_project_id;

    -- 2. Insert Response
    INSERT INTO public.rei_responses (
        project_id,
        responses,
        total_score,
        maturity_level,
        maturity_percentage,
        context,
        source,
        score_version
    ) VALUES (
        v_project_id,
        p_responses,
        p_score,
        p_maturity_level,
        p_score,
        'lead_gen',
        'diagnostic',
        'v2.0'
    ) RETURNING id INTO v_response_id;

    RETURN jsonb_build_object('project_id', v_project_id, 'response_id', v_response_id);
END;
$$;

GRANT EXECUTE ON FUNCTION create_diagnostic_entry TO anon, authenticated, service_role;

-- 2. Marcar diagnosticos antigos que ja foram criados com status='active'
-- para nao poluirem mais as views de projetos
UPDATE rei_projects
SET status = 'diagnostic', source = 'diagnostic'
WHERE id IN (
    SELECT rp.id
    FROM rei_projects rp
    INNER JOIN rei_responses rr ON rr.project_id = rp.id
    WHERE rr.source = 'diagnostic'
    AND rr.context = 'lead_gen'
    AND rp.status = 'active'
    AND rp.type IS NULL
);
