-- PUBLICAR O ARTIGO: "Como Estruturar um Funil de Vendas B2B que Converte"

-- Execute esta query no Supabase Studio (http://localhost:54323)
-- Ou cole no SQL Editor do admin

UPDATE blog_posts 
SET published = true 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte';

-- Verificar se funcionou:
SELECT 
  id,
  title, 
  slug, 
  published,
  date,
  category
FROM blog_posts 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte';

-- Resultado esperado:
-- published = true ✓
