-- 1. Cria o Bucket de Storage para Anexos (Tamanho Max: 50MB, Público para leitura das tarefas)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('task-attachments', 'task-attachments', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- 3. Policy: Qualquer um logado pode Ler anexos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anexos Leitura Autenticada' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Anexos Leitura Autenticada" ON storage.objects
        FOR SELECT USING (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 4. Policy: Qualquer um logado (Growth Hacker / Founder) pode Fazer Upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anexos Upload Autenticado' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Anexos Upload Autenticado" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 5. Policy: O próprio usuário que fez o upload pode Deletar (ou Super Admin)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anexos Delete Autenticado' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Anexos Delete Autenticado" ON storage.objects
        FOR DELETE USING (bucket_id = 'task-attachments' AND auth.role() = 'authenticated');
    END IF;
END $$;
