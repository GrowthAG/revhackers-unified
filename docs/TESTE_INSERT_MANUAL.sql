-- TESTE RÁPIDO: Inserir artigo manualmente no Supabase

-- Execute no SQL Editor do Supabase Studio (http://localhost:54323)

-- 1. Verificar se você está autenticado
SELECT auth.uid() as meu_user_id;
-- ☝️ Se retornar NULL, você não está logado

-- 2. Inserir o artigo de teste manualmente
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  author_id,
  published,
  date,
  read_time,
  image
) VALUES (
  'Como Estruturar um Funil de Vendas B2B que Converte',
  'como-estruturar-um-funil-de-vendas-b2b-que-converte',
  'Descubra o framework exato que empresas B2B usam para aumentar conversão em 3x. Aprenda a estruturar cada etapa do funil com métricas reais.',
  '## Por que 87% dos Funis B2B Falham

A maioria das empresas B2B constrói funis de vendas sem entender a jornada real do comprador. O resultado? Taxas de conversão abaixo de 2% e ciclos de vendas intermináveis.

Nos últimos 5 anos, analisamos mais de 200 funis de vendas B2B. Descobrimos que os funis de alta performance seguem um padrão específico que vamos revelar neste artigo.',
  'RevOps',
  auth.uid(), -- Seu user_id
  true, -- Publicado
  NOW(),
  '4 min',
  NULL
);

-- 3. Verificar se inseriu
SELECT id, title, slug, published FROM blog_posts 
WHERE slug = 'como-estruturar-um-funil-de-vendas-b2b-que-converte';

-- Se der ERRO, copie a mensagem de erro completa e me envie!
