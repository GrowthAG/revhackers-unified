-- CRIAR POLÍTICAS COMPLETAS PARA blog_posts

-- 1. Deletar a política genérica se existir
DROP POLICY IF EXISTS "Allow all for authenticated users" ON blog_posts;

-- 2. Criar políticas específicas para cada operação

-- SELECT: Qualquer um pode ler posts publicados
-- (Já existe: allow_public_select_blog_posts)

-- INSERT: Usuários autenticados podem criar posts
CREATE POLICY "allow_authenticated_insert_blog_posts"
ON blog_posts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE: Usuários autenticados podem atualizar qualquer post
CREATE POLICY "allow_authenticated_update_blog_posts"
ON blog_posts
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: Usuários autenticados podem deletar posts
CREATE POLICY "allow_authenticated_delete_blog_posts"
ON blog_posts
FOR DELETE
TO authenticated
USING (true);

-- 3. Verificar se as políticas foram criadas
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'blog_posts'
ORDER BY cmd;

-- Resultado esperado:
-- allow_public_select_blog_posts          | SELECT | {anon,authenticated}
-- allow_authenticated_insert_blog_posts   | INSERT | {authenticated}
-- allow_authenticated_update_blog_posts   | UPDATE | {authenticated}
-- allow_authenticated_delete_blog_posts   | DELETE | {authenticated}
