-- P0-03 (docs/departments/security/01-backlog.md): remove leitura anonima
-- global da tabela publica de diagnosticos (nome/email/telefone/respostas de
-- lead expostos hoje via SELECT anonimo irrestrito).
--
-- Descoberta desta migration: a tabela versionada em
-- 20251227000000_create_diagnostico_table.sql chama-se `public.diagnostico`
-- (singular), mas o schema gerado (src/integrations/supabase/types.ts) e todo
-- o codigo de aplicacao (src/api/publicDiagnostic.ts, src/services/
-- PipelineService.ts, src/pages/PublicDiagnosticResult.tsx) usam
-- `public.diagnosticos` (plural) + a view `diagnosticos_resumo`. Nenhuma
-- migration anterior cria essa tabela: ela existe hoje apenas no ambiente
-- remoto, fora do controle de versao (o mesmo drift generico ja registrado
-- em docs/architecture/gcp-migration/00-current-state.md). O
-- CREATE TABLE IF NOT EXISTS abaixo e um guarda defensivo para ambientes
-- locais/CI que nunca tiveram essa tabela criada; no ambiente remoto real
-- ele e um no-op porque a tabela ja existe. Colunas e tipos abaixo refletem
-- exatamente o que o schema gerado mostra (id, created_at, email, tipo,
-- score, respostas) - nenhuma coluna, default ou constraint alem disso foi
-- inventado.

CREATE TABLE IF NOT EXISTS public.diagnosticos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT NOT NULL,
    tipo TEXT NOT NULL,
    score INTEGER,
    respostas JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;

-- Remove qualquer policy existente na tabela, independente do nome - o
-- estado atual no ambiente remoto nao e verificavel estaticamente, entao a
-- limpeza precisa ser dinamica em vez de assumir os nomes usados em
-- 20251227000000_create_diagnostico_table.sql (que foi escrita para a
-- tabela singular, nao a plural realmente em uso).
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'diagnosticos'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.diagnosticos', pol.policyname);
    END LOOP;
END $$;

-- Unica policy remanescente: paineis administrativos autenticados continuam
-- lendo a tabela inteira (comportamento existente, fora do escopo deste
-- achado). Nenhuma policy de SELECT ou INSERT para `anon` e recriada - a
-- partir desta migration, o fluxo publico so acessa a tabela por RPC.
CREATE POLICY "diagnosticos_select_authenticated"
ON public.diagnosticos FOR SELECT
TO authenticated
USING (true);

REVOKE ALL ON public.diagnosticos FROM anon;
GRANT SELECT ON public.diagnosticos TO authenticated;

-- Mesma blindagem defensiva para a view diagnosticos_resumo (que expoe
-- email e nao e usada por nenhum codigo de aplicacao hoje, apenas referenciada
-- como FK target no schema gerado). A view nao tem migration propria, entao
-- so tocamos privilegios se ela existir no ambiente atual.
DO $$
BEGIN
    IF to_regclass('public.diagnosticos_resumo') IS NOT NULL THEN
        EXECUTE 'REVOKE ALL ON public.diagnosticos_resumo FROM anon';
    END IF;
END $$;

-- RPC de escrita: substitui o INSERT direto anonimo. Roda com privilegio do
-- owner (SECURITY DEFINER) para nao depender de nenhuma policy de INSERT
-- para `anon` na tabela.
CREATE OR REPLACE FUNCTION public.submit_diagnostico(
    p_email TEXT,
    p_tipo TEXT,
    p_score INTEGER,
    p_respostas JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.diagnosticos (email, tipo, score, respostas)
    VALUES (p_email, p_tipo, p_score, COALESCE(p_respostas, '{}'::jsonb))
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_diagnostico(TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_diagnostico(TEXT, TEXT, INTEGER, JSONB) TO anon, authenticated;

-- RPC de leitura: substitui o SELECT direto anonimo. Devolve apenas os
-- campos que a pagina publica de resultado (src/pages/PublicDiagnosticResult.tsx)
-- de fato le, e remove `email` e `respostas.lead_details` (telefone,
-- linkedin, cargo) do payload publico. Sem essa RPC, `email` e o bloco
-- `lead_details` inteiro ficavam expostos a qualquer requisicao anonima com
-- `select('*')`, mesmo sem serem renderizados pela pagina.
CREATE OR REPLACE FUNCTION public.get_diagnostico_public_result(p_id UUID)
RETURNS TABLE (
    id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    tipo TEXT,
    score INTEGER,
    respostas JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
    SELECT
        d.id,
        d.created_at,
        d.tipo,
        d.score,
        (d.respostas - 'lead_details') AS respostas
    FROM public.diagnosticos d
    WHERE d.id = p_id;
$$;

REVOKE ALL ON FUNCTION public.get_diagnostico_public_result(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_diagnostico_public_result(UUID) TO anon, authenticated;
