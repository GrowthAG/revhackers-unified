-- Migration: Create meeting recording tables for hybrid solution
-- Google Meet Native + Drive Sync + Whisper Transcription

-- Scheduled meetings (synced from Google Calendar)
CREATE TABLE IF NOT EXISTS scheduled_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_event_id TEXT UNIQUE,
    organizer_email TEXT,
    meet_url TEXT NOT NULL,
    title TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    attendees JSONB DEFAULT '[]',
    reminder_sent BOOLEAN DEFAULT FALSE,
    recording_found BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting recordings (synced from Google Drive)
CREATE TABLE IF NOT EXISTS meeting_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheduled_meeting_id UUID REFERENCES scheduled_meetings(id) ON DELETE SET NULL,
    rei_project_id UUID REFERENCES rei_projects(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    
    -- Google Drive metadata
    drive_file_id TEXT UNIQUE,
    drive_file_name TEXT,
    drive_web_view_link TEXT,
    drive_download_link TEXT,
    
    -- Recording metadata
    title TEXT,
    duration_seconds INTEGER,
    file_size_bytes BIGINT,
    happened_at TIMESTAMPTZ,
    
    -- Transcription (from Whisper)
    transcript TEXT,
    transcript_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
    transcribed_at TIMESTAMPTZ,
    
    -- AI Analysis
    ai_summary TEXT,
    ai_insights JSONB,
    ai_analyzed_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_start_time ON scheduled_meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_meetings_google_event ON scheduled_meetings(google_event_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_project ON meeting_recordings(rei_project_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_client ON meeting_recordings(client_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_drive_file ON meeting_recordings(drive_file_id);

-- RLS Policies
ALTER TABLE scheduled_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their meetings
CREATE POLICY "Users can view scheduled meetings" ON scheduled_meetings
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view meeting recordings" ON meeting_recordings
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role full access
CREATE POLICY "Service role full access to scheduled_meetings" ON scheduled_meetings
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access to meeting_recordings" ON meeting_recordings
    FOR ALL USING (auth.role() = 'service_role');

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scheduled_meetings_updated_at
    BEFORE UPDATE ON scheduled_meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_recordings_updated_at
    BEFORE UPDATE ON meeting_recordings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
