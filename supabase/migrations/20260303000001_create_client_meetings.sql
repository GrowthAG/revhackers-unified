-- ═══════════════════════════════════════════════════════════════════════════════
-- Tabela: client_meetings
-- Armazena reuniões do Google Meet com seus detalhes, gravações e participantes
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.client_meetings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identificação Google
    google_event_id TEXT UNIQUE NOT NULL,
    
    -- Dados da reunião
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    meeting_type TEXT NOT NULL DEFAULT 'outro'
        CHECK (meeting_type IN ('proposta', 'kickoff', 'planejamento', 'review', 'suporte', 'outro')),
    meeting_date TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'confirmed'
        CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
    
    -- Links
    meet_link TEXT DEFAULT '',
    calendar_link TEXT DEFAULT '',
    
    -- Gravação (Google Drive)
    video_url TEXT DEFAULT '',
    drive_file_id TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    recording_size_bytes BIGINT DEFAULT 0,
    has_recording BOOLEAN DEFAULT FALSE,
    
    -- Cliente (extraído dos participantes)
    client_name TEXT DEFAULT '',
    client_email TEXT DEFAULT '',
    client_contact_name TEXT DEFAULT '',
    
    -- Organizador
    organizer_email TEXT DEFAULT '',
    
    -- Participantes (JSON array)
    attendees JSONB DEFAULT '[]'::jsonb,
    
    -- Notas e descrição do evento
    event_notes TEXT DEFAULT '',
    
    -- Timestamps
    synced_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes para busca rápida
CREATE INDEX IF NOT EXISTS idx_client_meetings_client_email 
    ON public.client_meetings(client_email);
CREATE INDEX IF NOT EXISTS idx_client_meetings_meeting_date 
    ON public.client_meetings(meeting_date DESC);
CREATE INDEX IF NOT EXISTS idx_client_meetings_meeting_type 
    ON public.client_meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_client_meetings_google_event_id
    ON public.client_meetings(google_event_id);

-- RLS
ALTER TABLE public.client_meetings ENABLE ROW LEVEL SECURITY;

-- Policy: leitura para todos (anon e authenticated)
CREATE POLICY "Allow read client_meetings" ON public.client_meetings
    FOR SELECT USING (true);

-- Policy: insert/update apenas para service_role (Edge Function)
CREATE POLICY "Allow service_role write client_meetings" ON public.client_meetings
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger para auto-update updated_at
CREATE OR REPLACE FUNCTION update_client_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_client_meetings_updated_at
    BEFORE UPDATE ON public.client_meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_client_meetings_updated_at();
