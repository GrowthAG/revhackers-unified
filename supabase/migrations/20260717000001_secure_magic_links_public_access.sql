-- P0-02 (docs/departments/security/01-backlog.md): as policies publicas de
-- orqflow_magic_links e orqflow_tasks nunca comparam o token apresentado
-- pelo chamador contra o token da linha. Qualquer anonimo pode hoje:
--   - listar todo magic link nao expirado ("Magic links read by token match"
--     so checa expiracao, nunca o token);
--   - aprovar/rejeitar qualquer link pendente nao expirado ("Magic links
--     update only pending" so checa status/expiracao, nunca o token);
--   - ler qualquer task que tenha algum magic link ("Public can read tasks
--     with active magic links" nao verifica token nenhum).
--
-- Achado adicional (inspecao ao vivo do banco de producao antes de aplicar
-- esta migration, nao estava no achado original de Seguranca): existe uma
-- quarta policy, "Public can update status via token" (UPDATE, role
-- `public`, sem NENHUMA comparacao de token - so checa `status = 'pending'`).
-- Como `authenticated` mantem GRANT UPDATE completo na tabela via privilegio
-- padrao do schema (nao tocado por este REVOKE, que so mira `anon`), essa
-- policy sozinha permitiria que QUALQUER usuario autenticado do app
-- aprove/rejeite qualquer magic link pendente de qualquer projeto, sem
-- token - o mesmo bug do achado original, so que pelo lado autenticado em
-- vez do anonimo. Nenhum codigo em src/ ou supabase/functions/ depende de
-- update direto nesta tabela (grep confirmado, so MagicApproval.tsx toca a
-- tabela, e ja migra para RPC abaixo), entao remover esta policy tambem e
-- seguro.
--
-- O fluxo publico correto (src/pages/public/MagicApproval.tsx) so deveria
-- enxergar/mutar a linha cujo token exato o visitante apresenta na URL. Esta
-- migration move esse acesso para duas RPCs SECURITY DEFINER com
-- search_path fixo, que comparam o token dentro do banco, e retira o acesso
-- direto de `anon` as duas tabelas.

DROP POLICY IF EXISTS "Magic links read by token match" ON public.orqflow_magic_links;
DROP POLICY IF EXISTS "Magic links update only pending" ON public.orqflow_magic_links;
DROP POLICY IF EXISTS "Public can update status via token" ON public.orqflow_magic_links;
DROP POLICY IF EXISTS "Public can read tasks with active magic links" ON public.orqflow_tasks;

REVOKE ALL ON public.orqflow_magic_links FROM anon;
REVOKE ALL ON public.orqflow_tasks FROM anon;

-- RPC de leitura: substitui os dois SELECTs diretos (magic link + task) por
-- uma unica consulta que so devolve linha se o token apresentado bater
-- exatamente e o link nao estiver expirado.
CREATE OR REPLACE FUNCTION public.get_magic_link_task(p_token TEXT)
RETURNS TABLE (
    link_id UUID,
    link_status VARCHAR(50),
    link_expires_at TIMESTAMP WITH TIME ZONE,
    task_id UUID,
    task_title TEXT,
    task_content JSONB,
    task_created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        l.id,
        l.status,
        l.expires_at,
        t.id,
        t.title,
        t.content,
        t.created_at
    FROM public.orqflow_magic_links l
    JOIN public.orqflow_tasks t ON t.id = l.task_id
    WHERE l.token = p_token
      AND (l.expires_at IS NULL OR l.expires_at > now());
$$;

REVOKE ALL ON FUNCTION public.get_magic_link_task(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_magic_link_task(TEXT) TO anon, authenticated;

-- RPC de escrita: substitui o UPDATE direto. So aprova/rejeita se o token
-- bater, o link ainda estiver pendente e nao expirado - tudo numa unica
-- instrucao atomica (sem janela de corrida entre checar e atualizar). O
-- trigger orqflow_magic_link_trigger (ja SECURITY DEFINER, ver
-- 20260321000001_magic_links_audit_columns.sql) continua sincronizando o
-- status da task automaticamente; esta RPC nao precisa duplicar isso.
CREATE OR REPLACE FUNCTION public.resolve_magic_link(
    p_token TEXT,
    p_status TEXT,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
    link_id UUID,
    link_status VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_rows INTEGER;
BEGIN
    IF p_status NOT IN ('approved', 'rejected') THEN
        RAISE EXCEPTION 'invalid status: %', p_status;
    END IF;

    UPDATE public.orqflow_magic_links AS l
    SET status = p_status,
        approved_at = now(),
        approver_user_agent = left(p_user_agent, 255)
    WHERE l.token = p_token
      AND l.status = 'pending'
      AND (l.expires_at IS NULL OR l.expires_at > now())
    RETURNING l.id, l.status INTO link_id, link_status;

    GET DIAGNOSTICS v_rows = ROW_COUNT;

    IF v_rows > 0 THEN
        RETURN NEXT;
    END IF;

    RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_magic_link(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_magic_link(TEXT, TEXT, TEXT) TO anon, authenticated;
