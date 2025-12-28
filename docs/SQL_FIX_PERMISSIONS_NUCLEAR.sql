-- TENTATIVA FINAL E AGRESSIVA PARA PERMISSÕES
-- SE ISSO NÃO FUNCIONAR, O SUPABASE ESTÁ CONFIGURADO DE FORMA INCOMUM

-- 1. DESATIVA RLS NO STORAGE (Segurança Zero Temporária para Teste)
-- (Isso garante que "permissão" não seja o problema, se ainda falhar, é login)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 2. Recria o bucket como PÚBLICO
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-covers', 'blog-covers', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- OBS: Se isso funcionar, depois reativamos o RLS com as políticas certas.
-- Mas primeiro precisamos provar que é permissão.
