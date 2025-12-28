-- RODE ESTE COMANDO NO SUPABASE SQL EDITOR PARA CORRIGIR AS PERMISSÕES DE VISUALIZAÇÃO

-- Habilitar leitura pública na tabela de materiais
CREATE POLICY "Permitir Leitura Pública"
ON public.materials
FOR SELECT
TO anon, authenticated
USING (true);

-- (Opcional) Verificar se a tabela tem RLS ativado
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
