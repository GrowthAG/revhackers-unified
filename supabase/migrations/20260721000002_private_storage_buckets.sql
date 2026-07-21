-- ============================================================================
-- S-03: Tornar buckets de Storage privados (2026-07-21)
--
-- Os buckets meet_videos, rei-materials e revhackers-uploads estavam com
-- public=true, expondo URLs diretas de gravações de reuniões, materiais
-- estratégicos e uploads de propostas sem nenhuma autenticação.
--
-- Após esta migration, os arquivos só são acessíveis via:
--   supabase.storage.from('bucket').createSignedUrl(path, expiresIn)
--
-- O frontend deve ser atualizado para trocar getPublicUrl() por
-- createSignedUrl() nos três buckets listados abaixo.
-- ============================================================================

UPDATE storage.buckets
SET public = false
WHERE id IN (
    'meet_videos',
    'rei-materials',
    'revhackers-uploads'
);

-- Políticas de acesso autenticado para leitura (signed URL não é suficiente
-- sem policy — o storage engine também valida RLS)

-- meet_videos: apenas analista do projeto ou admin
DROP POLICY IF EXISTS "meet_videos_authenticated" ON storage.objects;
CREATE POLICY "meet_videos_scoped_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'meet_videos'
    AND (
        -- Analista do projeto pode acessar
        (storage.foldername(name))[1] IN (
            SELECT id::TEXT FROM public.rei_projects WHERE analyst_email = auth.email()
        )
        OR
        -- Admin/super_admin tem acesso total
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    )
);

-- rei-materials: qualquer autenticado pode ler (materiais do hub de clientes)
DROP POLICY IF EXISTS "rei-materials_authenticated" ON storage.objects;
CREATE POLICY "rei_materials_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'rei-materials');

-- rei-materials: apenas admin pode fazer upload
CREATE POLICY "rei_materials_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'rei-materials'
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- revhackers-uploads: acesso scoped ao projeto do arquivo
DROP POLICY IF EXISTS "revhackers-uploads_authenticated" ON storage.objects;
CREATE POLICY "revhackers_uploads_scoped_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'revhackers-uploads'
    AND (
        (storage.foldername(name))[1] IN (
            SELECT id::TEXT FROM public.rei_projects WHERE analyst_email = auth.email()
        )
        OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    )
);
