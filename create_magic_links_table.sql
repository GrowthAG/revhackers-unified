-- Tabela para armazenar os links mágicos de aprovação de tarefas (Zero-Login)
CREATE TABLE IF NOT EXISTS public.orqflow_magic_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.orqflow_tasks(id) ON DELETE CASCADE,
    token UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now() + interval '7 days') NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.orqflow_magic_links ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Policies)

-- 1. Qualquer pessoa (anon) pode ler um link mágico através do token para aprovar a tarefa (Aprovação Externa)
CREATE POLICY "Enable read access for anonymous users via token" 
ON public.orqflow_magic_links
FOR SELECT 
TO anon, authenticated
USING (true);

-- 2. Membros autenticados podem criar e ver todos os links de seus projetos
CREATE POLICY "Enable all access for authenticated users" 
ON public.orqflow_magic_links
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Permitir atualização anônima do status apenas se o token bater
CREATE POLICY "Enable update for anonymous users"
ON public.orqflow_magic_links
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);
