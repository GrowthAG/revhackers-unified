-- Migration: Melhorar Políticas RLS para Restringir Acesso
-- Data: 2024-12-25
-- Objetivo: Restringir operações de INSERT/UPDATE/DELETE apenas para super_admin

-- ============================================================================
-- TABELA: cases
-- ============================================================================

-- Remover políticas antigas permissivas
DROP POLICY IF EXISTS "Authenticated can insert cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated can update cases" ON public.cases;
DROP POLICY IF EXISTS "Authenticated can delete cases" ON public.cases;

-- Criar políticas restritas para super_admin
CREATE POLICY "Super admin can insert cases"
    ON public.cases FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can update cases"
    ON public.cases FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can delete cases"
    ON public.cases FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- TABELA: materials
-- ============================================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated can insert materials" ON public.materials;
DROP POLICY IF EXISTS "Authenticated can update materials" ON public.materials;
DROP POLICY IF EXISTS "Authenticated can delete materials" ON public.materials;

-- Criar políticas restritas para super_admin
CREATE POLICY "Super admin can insert materials"
    ON public.materials FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can update materials"
    ON public.materials FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can delete materials"
    ON public.materials FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- TABELA: blog_posts
-- ============================================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Authenticated can insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can update blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated can delete blog posts" ON public.blog_posts;

-- Criar políticas restritas para super_admin
CREATE POLICY "Super admin can insert blog posts"
    ON public.blog_posts FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can update blog posts"
    ON public.blog_posts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

CREATE POLICY "Super admin can delete blog posts"
    ON public.blog_posts FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON POLICY "Super admin can insert cases" ON public.cases IS 'Apenas super_admin pode criar cases';
COMMENT ON POLICY "Super admin can update cases" ON public.cases IS 'Apenas super_admin pode editar cases';
COMMENT ON POLICY "Super admin can delete cases" ON public.cases IS 'Apenas super_admin pode deletar cases';

COMMENT ON POLICY "Super admin can insert materials" ON public.materials IS 'Apenas super_admin pode criar materiais';
COMMENT ON POLICY "Super admin can update materials" ON public.materials IS 'Apenas super_admin pode editar materiais';
COMMENT ON POLICY "Super admin can delete materials" ON public.materials IS 'Apenas super_admin pode deletar materiais';

COMMENT ON POLICY "Super admin can insert blog posts" ON public.blog_posts IS 'Apenas super_admin pode criar posts';
COMMENT ON POLICY "Super admin can update blog posts" ON public.blog_posts IS 'Apenas super_admin pode editar posts';
COMMENT ON POLICY "Super admin can delete blog posts" ON public.blog_posts IS 'Apenas super_admin pode deletar posts';
