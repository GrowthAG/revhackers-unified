-- VERIFICAR POSTS NO BANCO DE DADOS

-- 1. Ver todos os posts (incluindo rascunhos)
SELECT 
  id, 
  title, 
  slug, 
  published, 
  date,
  created_at
FROM blog_posts 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Ver apenas posts publicados (o que aparece no frontend)
SELECT 
  id, 
  title, 
  slug, 
  published, 
  date
FROM blog_posts 
WHERE published = true
ORDER BY date DESC;

-- 3. SOLUÇÃO: Se o seu artigo está como rascunho, publique-o:
UPDATE blog_posts 
SET published = true 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte';
-- ☝️ Substitua o slug pelo slug do seu artigo

-- 4. Verificar se funcionou:
SELECT title, published FROM blog_posts 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte';
