-- Add UPDATE policy for rei_materials (needed for future text extraction pipeline)
CREATE POLICY "Public update on rei_materials"
  ON rei_materials FOR UPDATE USING (true) WITH CHECK (true);

-- Add UPDATE policy for storage objects in rei-materials bucket
CREATE POLICY "Public update on rei-materials storage"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'rei-materials')
  WITH CHECK (bucket_id = 'rei-materials');
