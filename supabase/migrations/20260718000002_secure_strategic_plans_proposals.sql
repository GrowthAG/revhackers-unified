-- Ultima frente da varredura completa (ver 20260718000000 e 20260718000001):
-- strategic_plans e proposals. Deixado por ultimo de proposito - sao as
-- tabelas de maior superficie de uso (quase 20 arquivos, incluindo o
-- webhook de pagamento InfinitePay), entao a investigacao foi mais lenta e
-- cuidadosa.
--
-- strategic_plans: "Anyone can view strategic_plans via token" (SELECT,
-- anon+authenticated, qual `true`) - mesmo bug de nomenclatura enganosa de
-- todos os achados desta sessao. A diferenca aqui e que JA EXISTE uma
-- policy correta e bem desenhada coexistindo ("Clients view plans via
-- token or admin", compara access_token contra o header HTTP
-- x-plan-token) - alguem ja tinha corrigido isso no passado e esqueceu de
-- remover a policy antiga. Só que o frontend NUNCA manda esse header
-- (grep confirmado em todo src/) - a policy correta e codigo morto do
-- lado do cliente. Por isso a correcao aqui e uma RPC (mesmo padrao do
-- resto desta sessao), nao reaproveitar a policy existente.
--
-- proposals: "Enable read access for public with token" (SELECT, public,
-- qual `true`) - mesmo bug. Só que aqui ja existe uma RPC correta
-- (get_proposal_by_slug, SECURITY DEFINER, escopada por slug) usada por
-- src/pages/public/PublicDealRoom.tsx - so faltava remover a policy aberta
-- redundante. Um segundo call site (StrategicPlanPresentation.tsx) buscava
-- proposals por client_name direto na tabela (nao pela RPC) - RPC nova
-- criada pra cobrir esse uso tambem.
--
-- Ambas tabelas tem varias UPDATEs feitas por paginas publicas
-- (StrategicPlanPresentation.tsx, PlanSignPage.tsx, PublicDealRoom.tsx -
-- tracking de visualizacao, secoes lidas, link de pagamento) que hoje ja
-- nao funcionam para anonimo: so existem policies de UPDATE para
-- `authenticated`/admin. Ou seja, esse tracking ja estava silenciosamente
-- quebrado antes desta migration - REVOKE ALL FROM anon nao muda esse
-- comportamento observavel, so remove o acesso de leitura irrestrita.
-- Restaurar esse tracking (via RPC dedicada) fica fora do escopo desta
-- correcao de seguranca pontual.

-- ============================================================================
-- strategic_plans
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view strategic_plans via token" ON public.strategic_plans;

REVOKE ALL ON public.strategic_plans FROM anon;

-- RETURNS SETOF (nao RETURNS TABLE com colunas explicitas): strategic_plans
-- e uma tabela larga (diagnostic_data, roadmap_data, okr_data,
-- onboarding_data, next_steps_data e mais); SETOF casa automaticamente com
-- o tipo de linha real da tabela, sem risco de esquecer/errar tipo de
-- coluna ao transcrever manualmente.
CREATE OR REPLACE FUNCTION public.get_public_strategic_plan(
    p_token TEXT,
    p_plan_type TEXT DEFAULT NULL
)
RETURNS SETOF public.strategic_plans
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT *
    FROM public.strategic_plans
    WHERE access_token = p_token
      AND (p_plan_type IS NULL OR plan_type = p_plan_type);
$$;

REVOKE ALL ON FUNCTION public.get_public_strategic_plan(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_strategic_plan(TEXT, TEXT) TO anon, authenticated;


-- ============================================================================
-- proposals
-- ============================================================================

DROP POLICY IF EXISTS "Enable read access for public with token" ON public.proposals;

REVOKE ALL ON public.proposals FROM anon;

-- Hardening de bonus: get_proposal_by_slug ja era SECURITY DEFINER e
-- corretamente escopada por slug, so faltava search_path fixo (mesmo achado
-- generico ja documentado em docs/departments/security/01-backlog.md P1 -
-- "15 de 16 SECURITY DEFINER sem search_path fixo"). CREATE OR REPLACE
-- preserva a assinatura e o comportamento, so adiciona o SET.
CREATE OR REPLACE FUNCTION public.get_proposal_by_slug(slug_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  result JSONB;
BEGIN
  SELECT to_jsonb(p) INTO result
  FROM public.proposals p
  WHERE p.slug = slug_input;

  RETURN result;
END;
$function$;

-- Segundo call site (StrategicPlanPresentation.tsx) buscava proposals por
-- client_name (nao por slug) - lookup fraco por natureza (nome de cliente
-- nao e segredo, e um match de conveniencia pra linkar a proposta
-- relacionada), mas ja era exatamente esse o comportamento antes desta
-- migration. RPC estreita o acesso: so devolve o slug, nao a linha
-- inteira, e so por esse unico campo de busca.
CREATE OR REPLACE FUNCTION public.get_proposal_slug_by_client(p_client_name TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT slug FROM public.proposals
    WHERE client_name = p_client_name
    ORDER BY created_at DESC
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_proposal_slug_by_client(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_proposal_slug_by_client(TEXT) TO anon, authenticated;
