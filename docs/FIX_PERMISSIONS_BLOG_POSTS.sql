-- VERIFICAR PERMISSÕES RLS DA TABELA blog_posts

-- 1. Ver se RLS está ativado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'blog_posts';
-- rowsecurity = true → RLS está ativo

-- 2. Ver todas as políticas (policies)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'blog_posts';

-- 3. SOLUÇÃO TEMPORÁRIA: Desabilitar RLS (APENAS PARA TESTE LOCAL)
-- ⚠️ NÃO USE EM PRODUÇÃO!
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;

-- 4. Ou criar política permissiva para authenticated users
DROP POLICY IF EXISTS "Allow all for authenticated users" ON blog_posts;

CREATE POLICY "Allow all for authenticated users"
ON blog_posts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Reativar RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 6. Testar se funcionou
-- Agora tente criar um artigo pelo admin novamente
