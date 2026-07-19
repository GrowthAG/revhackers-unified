-- Continuacao da varredura completa em pg_policies por predicados `true`
-- para roles public/anon (a mesma investigacao que gerou
-- 20260718000000_secure_hub_public_access.sql). Cobre 5 achados adicionais,
-- cada um verificado contra o uso real no codigo antes de decidir a
-- correcao - nao houve revogacao as cegas de tabela nenhuma.

-- ============================================================================
-- project_sprints / project_tasks: tabelas legado (migration
-- 20260115140000_create_sprint_system.sql), substituidas por
-- orqflow_sprints/orqflow_tasks (20260319200000_create_orqflow_engine.sql).
-- Zero referencia em src/ ou supabase/functions/ (grep confirmado). Uma
-- tentativa anterior de hardening (20260322000000_security_hardening.sql)
-- so trocou UMA policy antiga e nao tocou nas "Enable X for all users" que
-- ficaram. CRUD completo aberto para anon, sem nenhum consumidor legitimo -
-- trava total, sem RPC de substituicao.
-- ============================================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_sprints;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.project_sprints;
DROP POLICY IF EXISTS "Enable update for all users" ON public.project_sprints;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.project_sprints;
REVOKE ALL ON public.project_sprints FROM anon;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.project_tasks;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.project_tasks;
DROP POLICY IF EXISTS "Enable update for all users" ON public.project_tasks;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.project_tasks;
REVOKE ALL ON public.project_tasks FROM anon;


-- ============================================================================
-- rei_materials: usado so por src/pages/admin/ProjectWiki.tsx, que NAO esta
-- registrada em nenhuma rota de src/App.tsx (grep confirmado) - pagina
-- inacessivel pela UI hoje. Mesmo assim a tabela via API REST direta ficava
-- com CRUD anonimo completo aberto. Trava para authenticated, sem RPC (nao
-- ha fluxo anonimo alcancavel a preservar).
-- ============================================================================

DROP POLICY IF EXISTS "Public select on rei_materials" ON public.rei_materials;
DROP POLICY IF EXISTS "Public insert on rei_materials" ON public.rei_materials;
DROP POLICY IF EXISTS "Public update on rei_materials" ON public.rei_materials;
DROP POLICY IF EXISTS "Public delete on rei_materials" ON public.rei_materials;

CREATE POLICY "rei_materials_authenticated_all"
ON public.rei_materials FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.rei_materials FROM anon;


-- ============================================================================
-- cases: portfolio publico do site institucional - SELECT publico e
-- INTENCIONAL (allow_public_select_cases, "Public can view published
-- cases") e continua intocado. O problema e uma UNICA policy solta,
-- "Allow all deletes" (public, sem check nenhum), que coexiste com a
-- policy correta "Authenticated can delete cases" (ja suficiente). Remove
-- so a redundante e perigosa.
-- ============================================================================

DROP POLICY IF EXISTS "Allow all deletes" ON public.cases;


-- ============================================================================
-- organizations: "Organizations are viewable by everyone" (SELECT, public,
-- true) expunha mrr, billing_status, plan, custom_domain e settings (jsonb)
-- de toda organizacao (RevHackers e Funnels) a qualquer visitante anonimo.
-- Zero uso em src/ (grep confirmado) - as 6 Edge Functions que leem
-- organizations (ghl-oauth-callback, ghl-outbound-relay, ghl-oauth-refresh,
-- ghl-create-location, ghl-deploy-strategy, ghl-webhook-handoff) rodam com
-- service_role, que ignora RLS - nao dependem desta policy. Remove sem
-- substituto, nenhum consumidor legitimo identificado.
-- ============================================================================

DROP POLICY IF EXISTS "Organizations are viewable by everyone" ON public.organizations;
REVOKE ALL ON public.organizations FROM anon;


-- ============================================================================
-- document_signatures: INSERT aberto para anon ("Enable insert access for
-- anonymous users", with_check true) sem NENHUMA validacao - qualquer um
-- podia inserir um registro de assinatura eletronica falso (nome, cpf,
-- email, hash arbitrarios) num projeto de qualquer cliente. Fluxo anonimo
-- legitimo confirmado (src/components/legal/SignatureEngine.tsx, usado em
-- 4 paginas publicas: PlanSignPage, PublicKickoffValidation,
-- PublicDealRoom, StrategicPlanPresentation) - assinatura eletronica de
-- propostas/planos sem o cliente estar logado. RPC valida que o projeto
-- existe e que reference_type e um dos 3 valores aceitos pelo frontend
-- (proposal | strategic_plan | agent_document), antes de gravar.
--
-- reference_id e UUID na tabela, mas o fluxo de kickoff
-- (src/pages/public/PublicKickoffValidation.tsx) passa a string literal
-- "kickoff_validation", que nunca foi um UUID valido - bug preexistente,
-- nao introduzido nem corrigido aqui (RPC aceita TEXT e tenta o cast, igual
-- o INSERT direto ja fazia; falha do mesmo jeito para esse caso especifico).
--
-- Leitura: nao existia NENHUMA policy de SELECT para anon (so
-- "authenticated") - a pagina publica de certificado
-- (src/pages/public/CertificateOfAuthenticity.tsx) ja vinha retornando
-- "nao encontrado" pra todo mundo antes desta migration. RPC nova restaura
-- a funcao, escopada por document_hash (mesmo modelo de link secreto
-- unlisted ja usado em /plan/:token).
-- ============================================================================

DROP POLICY IF EXISTS "Enable insert access for anonymous users" ON public.document_signatures;
REVOKE ALL ON public.document_signatures FROM anon;

CREATE OR REPLACE FUNCTION public.submit_document_signature(
    p_project_id UUID,
    p_reference_type TEXT,
    p_reference_id TEXT,
    p_signer_name TEXT,
    p_signer_email TEXT,
    p_signer_cpf_cnpj TEXT,
    p_signer_role TEXT,
    p_signer_ip TEXT,
    p_user_agent TEXT,
    p_document_hash TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
    v_reference_uuid UUID;
BEGIN
    IF p_reference_type NOT IN ('proposal', 'strategic_plan', 'agent_document') THEN
        RAISE EXCEPTION 'invalid reference_type: %', p_reference_type;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.rei_projects WHERE id = p_project_id) THEN
        RAISE EXCEPTION 'unknown project_id';
    END IF;

    BEGIN
        v_reference_uuid := p_reference_id::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'invalid reference_id (expected uuid): %', p_reference_id;
    END;

    INSERT INTO public.document_signatures (
        project_id, reference_type, reference_id, signer_name, signer_cpf_cnpj,
        signer_email, signer_role, signer_ip, user_agent, document_hash
    )
    VALUES (
        p_project_id, p_reference_type, v_reference_uuid, p_signer_name, p_signer_cpf_cnpj,
        p_signer_email, p_signer_role, p_signer_ip, p_user_agent, p_document_hash
    )
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_document_signature(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_document_signature(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Devolve o registro completo de auditoria (CPF, IP, user-agent inclusos) -
-- essa e a funcao do proprio certificado: provar a trilha de assinatura pra
-- quem tiver o hash (mesmo modelo de link secreto unlisted de /plan/:token).
-- O hash SHA-256 e o segredo que protege o acesso, nao a ausencia de campos.
CREATE OR REPLACE FUNCTION public.get_signature_certificate(p_hash TEXT)
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
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        s.id, s.signer_name, s.signer_cpf_cnpj, s.signer_email, s.signer_role,
        s.signer_ip, s.user_agent, s.signed_at, s.created_at,
        s.document_hash, s.reference_type, p.trade_name
    FROM public.document_signatures s
    LEFT JOIN public.rei_projects p ON p.id = s.project_id
    WHERE s.document_hash = p_hash;
$$;

REVOKE ALL ON FUNCTION public.get_signature_certificate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_signature_certificate(TEXT) TO anon, authenticated;
