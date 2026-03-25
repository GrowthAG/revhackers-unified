-- =============================================================================
-- Migration: Chrome Extension Pipeline Readiness
-- Garante que o pipeline audio → Supabase esta pronto para a extensao Chrome
-- =============================================================================

-- 1. Indice para lookup rapido por transcript_status (Fill-REI query)
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_transcript_status
    ON meeting_recordings(transcript_status);

-- 2. Indice composto para a query principal do generate-strategic-plan
--    (rei_project_id + transcript_status + happened_at DESC)
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_project_transcript
    ON meeting_recordings(rei_project_id, transcript_status, happened_at DESC)
    WHERE transcript_status = 'completed';

-- 3. Garantir que rei_responses tem indice em project_id
--    (trigger-post-rei-enrichment fazia query por rei_project_id - agora corrigido para project_id)
CREATE INDEX IF NOT EXISTS idx_rei_responses_project_id
    ON rei_responses(project_id);

-- 4. Coluna transcript_source_recording em rei_responses para rastreabilidade
--    Indica qual recording originou o auto-fill dos campos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'rei_responses'
        AND column_name = 'transcript_source_recording'
    ) THEN
        ALTER TABLE rei_responses
            ADD COLUMN transcript_source_recording UUID REFERENCES meeting_recordings(id) ON DELETE SET NULL;

        COMMENT ON COLUMN rei_responses.transcript_source_recording
            IS 'UUID do meeting_recording que originou o auto-fill via fill-rei-from-transcript';
    END IF;
END $$;

-- 5. Coluna transcript_autofill_at para auditoria
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'rei_responses'
        AND column_name = 'transcript_autofill_at'
    ) THEN
        ALTER TABLE rei_responses
            ADD COLUMN transcript_autofill_at TIMESTAMPTZ;

        COMMENT ON COLUMN rei_responses.transcript_autofill_at
            IS 'Timestamp do ultimo auto-fill de campos via transcript';
    END IF;
END $$;

-- =============================================================================
-- CHECKLIST DE SUPABASE SECRETS (executar no dashboard Supabase > Edge Functions > Secrets)
-- =============================================================================
-- OBRIGATORIOS (sem estes o pipeline nao funciona):
--
--   OPENAI_API_KEY          → chave da OpenAI (Whisper + GPT-5.4)
--   SUPABASE_URL            → URL do projeto Supabase (gerado automaticamente)
--   SUPABASE_SERVICE_ROLE_KEY → service role key (gerado automaticamente)
--
-- CRITICO - ADICIONADO RECENTEMENTE (estava hardcoded):
--
--   TLDV_API_KEY            → (configurar via supabase secrets set)
--                             (fetch-tldv-meeting vai retornar 500 sem este Secret)
--
-- DESCONTINUADOS (podem ser removidos apos migracao completa para extensao Chrome):
--
--   NOTION_API_KEY          → nao usado mais em generate-strategic-plan
--                             ainda usado em: sync-notion-project, generate-playbook
--                             remover apenas apos descontinuar esses dois funcoes
-- =============================================================================
