-- ==============================================================================
-- UPDATE 4: ARQUITETURA SPLIT-STREAM (SUPABASE STORAGE PARA VIDEOS)
-- Gravação pesada de reuniões agora desvia do limite das Edge Functions e vai pro Storage
-- ==============================================================================

-- 1. Coluna Curinga na Tabela Principal de Reuniões
ALTER TABLE public.meeting_recordings ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 2. Criar o Cofre Visual (Supabase Storage Bucket)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('meet_videos', 'meet_videos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Limpar políticas antigas se bater colisão (Idempotência Total)
DO $$ 
BEGIN
    BEGIN
        DROP POLICY "Public Access" ON storage.objects;
        DROP POLICY "Auth Upload" ON storage.objects;
    EXCEPTION
        WHEN undefined_object THEN null;
    END;
END $$;

-- 4. RLS - Libera Upload Autenticado e Leitura Pública para Links da CRM
CREATE POLICY "PublicVideoReadAccess" ON storage.objects FOR SELECT USING (bucket_id = 'meet_videos');
CREATE POLICY "AuthVideoUploadAccess" ON storage.objects FOR INSERT USING (bucket_id = 'meet_videos' AND auth.role() = 'authenticated');
CREATE POLICY "AuthVideoUpdateAccess" ON storage.objects FOR UPDATE USING (bucket_id = 'meet_videos' AND auth.role() = 'authenticated');
