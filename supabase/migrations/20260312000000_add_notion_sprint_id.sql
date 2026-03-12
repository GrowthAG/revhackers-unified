-- Adiciona notion_sprint_id em rei_projects
-- Armazena o ID da Sprint criada no Notion durante o setup do projeto (Fase 1)
-- Usado na Fase 2 (enrich) para criar a Task vinculada à Sprint correta

ALTER TABLE rei_projects
ADD COLUMN IF NOT EXISTS notion_sprint_id TEXT DEFAULT NULL;

COMMENT ON COLUMN rei_projects.notion_sprint_id IS
'ID da página Sprint no Notion, criada quando o admin cadastra o projeto (Fase 1 do sync). Usado para vincular a Task criada após o preenchimento do REI (Fase 2).';
