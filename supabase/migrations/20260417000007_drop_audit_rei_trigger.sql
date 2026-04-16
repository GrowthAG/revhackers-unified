-- Fix REAL: O trigger se chama audit_rei_projects (nao audit_trigger).
-- Desabilitando para destravar o pipeline de criacao de projetos.

DROP TRIGGER IF EXISTS audit_rei_projects ON public.rei_projects;
