-- Adicionar coluna para rastrear quando o link do docs foi atualizado
ALTER TABLE strategic_plans ADD COLUMN clickup_docs_updated_at TIMESTAMP WITH TIME ZONE;
