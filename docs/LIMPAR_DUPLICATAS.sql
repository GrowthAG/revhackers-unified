-- LIMPAR DUPLICATAS DO ARTIGO

-- 1. Ver todos os artigos duplicados
SELECT id, title, slug, published, date 
FROM blog_posts 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte'
ORDER BY date DESC;

-- 2. Manter apenas o ÚLTIMO (published = true) e deletar os outros
-- Substitua os IDs pelos IDs reais que você viu na tabela

-- OPÇÃO A: Deletar por ID específico (mais seguro)
DELETE FROM blog_posts 
WHERE id IN (
  'acb80640-295c-4437-b2d4-21fb0efe2d65',  -- Primeiro (false)
  '67bf2d1a-cc12-41c4-9b01-e04c5bff0d64'   -- Segundo (true)
);
-- ☝️ Mantenha apenas o último ID (4d81eb48-3817-4ba6-85dd-bb1593eecba0)

-- OPÇÃO B: Deletar todos menos o mais recente (automático)
DELETE FROM blog_posts 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte'
AND id NOT IN (
  SELECT id FROM blog_posts 
  WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte'
  ORDER BY date DESC 
  LIMIT 1
);

-- 3. Verificar se ficou apenas 1
SELECT COUNT(*) as total FROM blog_posts 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte';
-- Resultado esperado: total = 1
