-- SCRIPT SEGURO PARA CORRIGIR PERMISSÕES (Rode no Supabase SQL Editor)
-- Este script não tenta alterar tabelas de sistema, apenas cria as regras.

BEGIN;

-- 1. Garante que o bucket 'blog-covers' existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Limpa políticas antigas para evitar erros de duplicidade
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Tudo" ON storage.objects;

-- 3. Cria novas políticas permitindo tudo para usuários logados
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'blog-covers' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'blog-covers' );

CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'blog-covers' );

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'blog-covers' );

COMMIT;
