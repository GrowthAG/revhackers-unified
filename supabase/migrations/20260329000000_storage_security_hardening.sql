-- Migration: Hardening de RLS para Storage e Materiais
-- Data: 2026-03-29
-- Objetivo: Restringir acesso de escrita a buckets e tabelas abertas (rei-materials, blog-covers, revhackers-uploads)

-- ============================================================================
-- 1. TABELA: rei_materials
-- ============================================================================

-- Remover restrição frágil
DROP POLICY IF EXISTS "Public delete on rei_materials" ON public.rei_materials;

-- Adicionar proteção rigorosa: Apenas super_admin e admin podem deletar materiais do sistema
CREATE POLICY "Admins can delete rei_materials"
    ON public.rei_materials FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

-- ============================================================================
-- 2. STORAGE (BUCKETS DE UPLOAD)
-- ============================================================================

-- A. Bucket rei-materials (Antes era PUBLIC)
DROP POLICY IF EXISTS "Public upload to rei-materials" ON storage.objects;
DROP POLICY IF EXISTS "Public delete from rei-materials" ON storage.objects;

CREATE POLICY "Admins can upload to rei-materials"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'rei-materials' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Admins can delete from rei-materials"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'rei-materials' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

-- B. Buckets Legados: blog-covers e revhackers-uploads
-- Antes permitiam 'to authenticated' incondicionalmente para INSERT, DELETE e UPDATE
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

CREATE POLICY "Admins can upload to system buckets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id IN ('blog-covers', 'revhackers-uploads') AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Admins can update system buckets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id IN ('blog-covers', 'revhackers-uploads') AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Admins can delete from system buckets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id IN ('blog-covers', 'revhackers-uploads') AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
    );
