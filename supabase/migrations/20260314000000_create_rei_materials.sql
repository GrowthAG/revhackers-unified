-- Create rei_materials table for client reference materials (AI-connected)
CREATE TABLE IF NOT EXISTS rei_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES rei_projects(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL DEFAULT 'outro',
  source_type TEXT NOT NULL DEFAULT 'upload',
  file_url TEXT,
  original_name TEXT,
  description TEXT,
  extracted_text TEXT,
  status TEXT DEFAULT 'ready',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by project
CREATE INDEX IF NOT EXISTS idx_rei_materials_project_id ON rei_materials(project_id);

-- RLS
ALTER TABLE rei_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert on rei_materials"
  ON rei_materials FOR INSERT WITH CHECK (true);

CREATE POLICY "Public select on rei_materials"
  ON rei_materials FOR SELECT USING (true);

CREATE POLICY "Public delete on rei_materials"
  ON rei_materials FOR DELETE USING (true);

-- Create storage bucket for material files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('rei-materials', 'rei-materials', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public upload to rei-materials"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'rei-materials');

CREATE POLICY "Public read from rei-materials"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'rei-materials');

CREATE POLICY "Public delete from rei-materials"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'rei-materials');
