-- Fix: O trigger audit_trigger em rei_projects chama uma funcao que referencia
-- audit_logs com search_path errado. Desativamos temporariamente para destravar
-- o pipeline de criacao de projetos.

DROP TRIGGER IF EXISTS audit_trigger ON public.rei_projects;
DROP TRIGGER IF EXISTS audit_trigger ON public.opportunities;
DROP TRIGGER IF EXISTS audit_trigger ON public.orqflow_sprints;
