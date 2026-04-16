-- Fix crítico: client_accounts tem RLS ativada mas ZERO policies.
-- Sem isso, a interface AdminClientAccounts retorna sempre vazio para usuários logados.

ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

-- Leitura para qualquer usuário autenticado (admin vê todos)
DROP POLICY IF EXISTS "Authenticated users can read client_accounts" ON public.client_accounts;
CREATE POLICY "Authenticated users can read client_accounts"
    ON public.client_accounts FOR SELECT
    TO authenticated
    USING (true);

-- Escrita total para service_role (Edge Functions)
DROP POLICY IF EXISTS "Service role can manage client_accounts" ON public.client_accounts;
CREATE POLICY "Service role can manage client_accounts"
    ON public.client_accounts FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Super admin pode editar manualmente se precisar
DROP POLICY IF EXISTS "Super admin can manage client_accounts" ON public.client_accounts;
CREATE POLICY "Super admin can manage client_accounts"
    ON public.client_accounts FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );
