-- Achado critico na varredura de Storage (2026-07-19, continuacao da
-- varredura de tabelas de 2026-07-17/18): storage.objects tinha uma
-- policy chamada "Permitir Tudo" (SELECT/INSERT/UPDATE/DELETE, role
-- public, sem NENHUM filtro de bucket_id) - CRUD anonimo completo em
-- TODOS os arquivos de TODOS os buckets do projeto, independente de
-- qual bucket. Alem dela, policies especificas redundantes davam o
-- mesmo acesso anonimo total para rei-materials (4 policies),
-- meet_videos (leitura) e revhackers-uploads ("Anon_Temp_Select/Upload",
-- nome sugere que era temporario e nunca foi removido).
--
-- Confirmado por grep em todo src/: nenhum consumidor publico real para
-- rei-materials ou meet_videos (todo upload/leitura vem de paginas
-- /admin/* autenticadas; um componente que lia meet_videos nem e usado
-- em lugar nenhum). task-attachments tem RLS ja corretamente escopada
-- para authenticated, mas ZERO uso no codigo (feature nunca
-- implementada no frontend, so existe no schema) - seguro marcar o
-- bucket como privado sem nenhum ajuste de frontend.
--
-- IMPORTANTE - o que esta migration NAO resolve sozinha: o flag
-- `public = true` no proprio bucket faz o Supabase Storage servir
-- objetos via `/object/public/...` SEM checar RLS nenhuma - as
-- correcoes de policy abaixo sao necessarias mas nao suficientes
-- enquanto o bucket continuar public=true. Marquei aqui como privado
-- so o bucket sem nenhum consumidor de codigo (task-attachments).
-- meet_videos, rei-materials e revhackers-uploads continuam
-- public=true nesta migration porque o frontend
-- (src/utils/uploadImageToSupabase.ts, uploadFileToSupabase.ts) usa
-- `getPublicUrl()` para eles - virar privado exige trocar para
-- `createSignedUrl()` e verificar cada tela que renderiza essas URLs,
-- trabalho maior que fica registrado como pendente (nao decidido
-- sozinho, mesma linha do achado de "buckets publicos" ja documentado).

-- ============================================================================
-- Policy global sem escopo de bucket - a mais grave, remove primeiro
-- ============================================================================

DROP POLICY IF EXISTS "Permitir Tudo 8qzp5z_0" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Tudo 8qzp5z_1" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Tudo 8qzp5z_2" ON storage.objects;
DROP POLICY IF EXISTS "Permitir Tudo 8qzp5z_3" ON storage.objects;

-- blog-covers dependia inteiramente da policy acima (nenhuma policy
-- propria existia) - recria explicitamente: leitura publica intencional
-- (blog e portfolio de cases sao publicos), escrita so autenticado.
CREATE POLICY "blog_covers_public_select"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-covers');

CREATE POLICY "blog_covers_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-covers');

CREATE POLICY "blog_covers_authenticated_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-covers');

CREATE POLICY "blog_covers_authenticated_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-covers');


-- ============================================================================
-- rei-materials: fecha CRUD anonimo, mantem uso autenticado (mesmo padrao
-- da tabela public.rei_materials corrigida em 2026-07-18)
-- ============================================================================

DROP POLICY IF EXISTS "Public read from rei-materials" ON storage.objects;
DROP POLICY IF EXISTS "Public upload to rei-materials" ON storage.objects;
DROP POLICY IF EXISTS "Public update on rei-materials storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete from rei-materials" ON storage.objects;

CREATE POLICY "rei_materials_storage_authenticated_all"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'rei-materials')
WITH CHECK (bucket_id = 'rei-materials');


-- ============================================================================
-- meet_videos: fecha leitura anonima. INSERT/UPDATE ja tinham policy
-- authenticated correta (AuthVideoUploadAccess/AuthVideoUpdateAccess),
-- so faltava SELECT escopado.
-- ============================================================================

DROP POLICY IF EXISTS "PublicVideoReadAccess" ON storage.objects;

CREATE POLICY "meet_videos_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'meet_videos');


-- ============================================================================
-- revhackers-uploads: fecha o acesso anonimo "temporario" que nunca foi
-- removido. Usado por ProposalForm.tsx (upload de imagem em contexto
-- admin autenticado).
-- ============================================================================

DROP POLICY IF EXISTS "Anon_Temp_Select" ON storage.objects;
DROP POLICY IF EXISTS "Anon_Temp_Upload" ON storage.objects;

CREATE POLICY "revhackers_uploads_authenticated_select"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'revhackers-uploads');

CREATE POLICY "revhackers_uploads_authenticated_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'revhackers-uploads');


-- ============================================================================
-- task-attachments: RLS ja estava correta (Anexos Leitura/Upload/Delete
-- Autenticado, criadas antes desta sessao) - o problema era so o bucket
-- estar public=true, tornando essa RLS decorativa no caminho de leitura.
-- Feature confirmada sem nenhum uso no frontend (grep em todo src/) -
-- seguro marcar privado sem quebrar nada.
-- ============================================================================

UPDATE storage.buckets SET public = false WHERE id = 'task-attachments';
