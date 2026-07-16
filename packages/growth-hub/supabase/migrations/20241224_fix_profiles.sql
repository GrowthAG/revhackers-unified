-- 1. Create 'profiles' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policies for 'profiles' storage
BEGIN;
  DROP POLICY IF EXISTS "Public View Profiles" ON storage.objects;
  DROP POLICY IF EXISTS "Auth Upload Profiles" ON storage.objects;
  DROP POLICY IF EXISTS "Auth Update Profiles" ON storage.objects;
  
  CREATE POLICY "Public View Profiles" ON storage.objects FOR SELECT USING ( bucket_id = 'profiles' );
  CREATE POLICY "Auth Upload Profiles" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'profiles' AND auth.role() = 'authenticated' );
  CREATE POLICY "Auth Update Profiles" ON storage.objects FOR UPDATE USING ( bucket_id = 'profiles' AND auth.uid() = owner );
COMMIT;

-- 3. Update 'profiles' table with new collaborator fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS personal_email text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'; -- pending, approved, suspended

-- 4. Ensure 'bio' column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text;
