-- P0 novo (achado via inspecao ao vivo do banco de producao, nao estava no
-- backlog original de Seguranca): investigando por que a pagina publica
-- /hub/:id (src/pages/client/ClientProjectHub.tsx, sem ProtectedRoute) vinha
-- vazia pra visitantes anonimos, apareceram 2 problemas na mesma direcao,
-- um deles mais grave que o motivo original da investigacao.
--
-- 1) knowledge_libraries: 4 policies "Enable ... for all users" (role
--    `public`, qual/with_check `true`) permitem SELECT, INSERT, UPDATE e
--    DELETE irrestritos por qualquer anonimo. Nao ha nenhuma restricao de
--    tenant/projeto nem de autenticacao.
-- 2) rei_responses (respostas de diagnostico REI de clientes): coexistem
--    policies bem desenhadas (escopadas por client_email/analyst_email/role
--    via profiles) com 4 policies soltas com qual/with_check `true` para
--    role `public` ("Users can view responses", "Users can insert
--    responses", "Users can update responses", "Admins can update
--    responses" - esta ultima mal nomeada, nao checa role nenhum). RLS e
--    permissivo (OR entre policies), entao as policies abertas anulam as
--    escopadas: qualquer anonimo pode ler, inserir ou atualizar qualquer
--    linha.
--
-- Fluxo legitimo confirmado no codigo (src/components/client/HubNpsBlocker.tsx,
-- renderizado dentro do proprio ClientProjectHub.tsx): a pagina publica
-- pede uma nota NPS de 0-10 antes de liberar o hub, e insere isso em
-- rei_responses sem o visitante estar autenticado. Esta migration fecha o
-- acesso aberto mas preserva esse fluxo via RPC dedicada, em vez de
-- simplesmente revogar tudo.
--
-- Motivo original da investigacao: orqflow_tasks e orqflow_sprints (secao
-- "Live Orqflow Secure Data" da mesma pagina) so tem policy para
-- `authenticated` (`auth.role() = 'authenticated'`), nenhuma para anon -
-- ou seja, a pagina publica ja vinha retornando essas duas listas vazias
-- para qualquer visitante, antes mesmo desta migration. Adiciona RPCs
-- publicas escopadas por project_id para restaurar a funcionalidade sem
-- abrir SELECT direto na tabela.

-- ============================================================================
-- knowledge_libraries: fecha CRUD aberto, mantem uso autenticado existente
-- ============================================================================

DROP POLICY IF EXISTS "Enable read access for all users" ON public.knowledge_libraries;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.knowledge_libraries;
DROP POLICY IF EXISTS "Enable update for all users" ON public.knowledge_libraries;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.knowledge_libraries;

-- Nenhuma tela autenticada hoje restringe por role (AIPlaybookGenerator,
-- DocumentPickerModal, ProjectWiki rodam atras de ProtectedRoute, que exige
-- login mas nao um role especifico) - policy authenticated ampla preserva o
-- comportamento atual, so remove o acesso anonimo.
CREATE POLICY "knowledge_libraries_authenticated_all"
ON public.knowledge_libraries FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

REVOKE ALL ON public.knowledge_libraries FROM anon;

CREATE OR REPLACE FUNCTION public.get_public_knowledge_library_id(p_project_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT id FROM public.knowledge_libraries WHERE project_id = p_project_id LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_knowledge_library_id(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_knowledge_library_id(UUID) TO anon, authenticated;

-- agent_documents ja estava seguro (unica policy exige profiles.role IN
-- admin/super_admin, anon nao passa por isso mesmo com GRANT de tabela) -
-- nao precisa de mudanca. ClientProjectHub.tsx so le agent_documents depois
-- de achar a library, entao a RPC acima ja restaura o fluxo: sem policy de
-- SELECT anonima em agent_documents, o app precisa de uma RPC tambem -
-- adicionada abaixo, devolvendo so os campos que a pagina publica usa.
CREATE OR REPLACE FUNCTION public.get_public_shared_documents(p_library_id UUID)
RETURNS TABLE (
    id UUID,
    filename TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT d.id, d.filename, d.metadata, d.created_at
    FROM public.agent_documents d
    WHERE d.library_id = p_library_id
      AND (d.metadata->>'visibility') IN ('shared', 'final')
    ORDER BY d.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_public_shared_documents(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_shared_documents(UUID) TO anon, authenticated;


-- ============================================================================
-- rei_responses: fecha SELECT/INSERT/UPDATE abertos, preserva o envio de NPS
-- publico via RPC. Policies autenticadas escopadas (client/analyst/admin)
-- nao sao tocadas.
-- ============================================================================

DROP POLICY IF EXISTS "Users can view responses" ON public.rei_responses;
DROP POLICY IF EXISTS "Users can insert responses" ON public.rei_responses;
DROP POLICY IF EXISTS "Users can update responses" ON public.rei_responses;
DROP POLICY IF EXISTS "Admins can update responses" ON public.rei_responses;

REVOKE ALL ON public.rei_responses FROM anon;

-- RPC de leitura: usada so pra checar se o NPS ja foi respondido neste
-- device/projeto (ClientProjectHub.tsx checa .maybeSingle() por
-- project_id). Devolve so o id, nunca o conteudo da resposta.
--
-- CORRECAO (achado ao aplicar em producao): rei_responses NAO TEM coluna
-- diagnostic_type (confirmado via information_schema apos erro real
-- 42703 na primeira tentativa de aplicar esta migration) - o insert
-- original de HubNpsBlocker.tsx ja tentava gravar esse campo inexistente,
-- ou seja, o submit de NPS provavelmente ja falhava silenciosamente em
-- producao antes desta migration (consistente com o catch de
-- HubNpsBlocker.tsx que desbloqueia a UI mesmo se o insert falhar).
-- Discriminador real usado: context = 'public', valor nunca usado por
-- nenhuma linha historica de rei_responses (confirmado via
-- `SELECT DISTINCT context FROM rei_responses` antes de escrever isto -
-- valores existentes sao 'lead_gen' e 'internal').
CREATE OR REPLACE FUNCTION public.has_public_nps_response(p_project_id UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT id FROM public.rei_responses
    WHERE project_id = p_project_id AND context = 'public'
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.has_public_nps_response(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_public_nps_response(UUID) TO anon, authenticated;

-- RPC de escrita: unico fluxo anonimo legitimo encontrado no codigo
-- (HubNpsBlocker.tsx). Campos fixos no lado do banco (context,
-- diagnostic_type, source, maturity_level) em vez de aceitos do chamador -
-- o visitante so controla score (0-10) e comentario.
CREATE OR REPLACE FUNCTION public.submit_hub_nps(
    p_project_id UUID,
    p_score INTEGER,
    p_comment TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_score IS NULL OR p_score < 0 OR p_score > 10 THEN
        RAISE EXCEPTION 'invalid score: %', p_score;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.rei_projects WHERE id = p_project_id) THEN
        RAISE EXCEPTION 'unknown project_id';
    END IF;

    INSERT INTO public.rei_responses (
        project_id, context, responses,
        total_score, maturity_level, maturity_percentage, source
    )
    VALUES (
        p_project_id, 'public',
        jsonb_build_object(
            'nps_score', p_score,
            'nps_comment', p_comment,
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


-- ============================================================================
-- rei_projects: o achado mais grave desta migration. "Users can view their
-- own projects" (SELECT, public, qual true), "Admins can insert projects" +
-- "Users can insert projects" (INSERT, public, with_check true), "Admins
-- can update projects" + "Users can update projects" (UPDATE, public, qual
-- true) - nomes sugerem restricao mas os predicados sao `true`. Qualquer
-- anonimo pode ler OU ALTERAR qualquer projeto de cliente (nome, email,
-- empresa, status, analyst_email, etc.) na tabela central do produto.
--
-- src/api/reiProjects.ts:getPublicReiProjectById() depende dessa policy
-- aberta pra funcionar (SELECT direto com lista de colunas limitada, mas
-- sem filtro nenhum alem de id). O UPDATE de `last_login_at` em
-- ClientProjectHub.tsx:109-114 NUNCA funcionou de verdade - a coluna
-- `last_login_at` nao existe em rei_projects (confirmado via
-- information_schema), entao ja falhava antes desta migration por coluna
-- inexistente, capturado pelo .then(error) que so logava um aviso
-- (mal-diagnosticado como "RLS might block"). Nao precisa de RPC de
-- substituicao - o comportamento observavel nao muda.
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own projects" ON public.rei_projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.rei_projects;
DROP POLICY IF EXISTS "Users can insert projects" ON public.rei_projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.rei_projects;
DROP POLICY IF EXISTS "Users can update projects" ON public.rei_projects;

REVOKE ALL ON public.rei_projects FROM anon;

-- RPC de leitura: mesma lista de colunas que getPublicReiProjectById() ja
-- selecionava (nenhum campo novo exposto), trade_name via join explicito
-- com clients (mesma relacao que o embed `clients ( trade_name )` do
-- PostgREST resolvia). Continua sem filtro alem de id - preserva o modelo
-- de "link compartilhavel por UUID" ja usado em /plan/:token e /hub/:id,
-- redesenhar isso para isolamento por tenant de verdade e o P1 ja
-- registrado em docs/departments/security/01-backlog.md, fora de escopo
-- deste fix pontual.
CREATE OR REPLACE FUNCTION public.get_public_rei_project_summary(p_id UUID)
RETURNS TABLE (
    id UUID,
    client_name TEXT,
    client_email TEXT,
    client_company TEXT,
    status TEXT,
    scheduling_completed BOOLEAN,
    analyst_email TEXT,
    next_rei_date TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    type TEXT,
    trade_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        p.id, p.client_name, p.client_email, p.client_company, p.status,
        p.scheduling_completed, p.analyst_email, p.next_rei_date, p.created_at, p.type,
        c.trade_name
    FROM public.rei_projects p
    LEFT JOIN public.clients c ON c.id = p.client_id
    WHERE p.id = p_id;
$$;

REVOKE ALL ON FUNCTION public.get_public_rei_project_summary(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_rei_project_summary(UUID) TO anon, authenticated;


-- ============================================================================
-- orqflow_sprints / orqflow_tasks: motivo original da investigacao. Nenhuma
-- policy anonima existia antes desta migration (so "Enable ALL for
-- authenticated"), entao a pagina publica ja vinha estas duas listas
-- vazias. RPCs escopadas por project_id restauram a funcionalidade sem
-- abrir SELECT direto.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_public_project_sprints(p_project_id UUID)
RETURNS TABLE (
    id UUID,
    name TEXT,
    status TEXT,
    start_date DATE,
    end_date DATE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT s.id, s.name, s.status::text, s.start_date, s.end_date
    FROM public.orqflow_sprints s
    WHERE s.project_id = p_project_id
    ORDER BY s.start_date ASC;
$$;

REVOKE ALL ON FUNCTION public.get_public_project_sprints(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_project_sprints(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_public_project_tasks(p_project_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    status TEXT,
    sprint_id UUID,
    due_date TIMESTAMP WITH TIME ZONE,
    priority TEXT,
    position_order INTEGER
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT t.id, t.title, t.status::text, t.sprint_id, t.due_date, t.priority::text, t.position_order
    FROM public.orqflow_tasks t
    WHERE t.project_id = p_project_id
      AND t.status <> 'cancelled'
    ORDER BY t.position_order ASC NULLS LAST, t.due_date ASC NULLS LAST;
$$;

REVOKE ALL ON FUNCTION public.get_public_project_tasks(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_project_tasks(UUID) TO anon, authenticated;
