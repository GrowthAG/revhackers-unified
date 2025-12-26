-- 1. Ensure the profiles table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  
  -- New columns for registration
  cpf TEXT,
  address TEXT,
  personal_email TEXT,
  bio TEXT,
  status TEXT DEFAULT 'pending',
  role TEXT DEFAULT 'user',
  email TEXT -- Cache for easier querying
);

-- 2. Add columns if they are missing (Safe Migration)
DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS personal_email TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
END $$;

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Fix Policies (Drop old ones to be safe)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 5. Set Giulliano as Super Admin (based on screenshot email)
-- We try to update based on the username 'giualvess' or email if possible
UPDATE public.profiles
SET role = 'super_admin', status = 'active'
WHERE 
    personal_email = 'giulliano@revhackers.com.br' OR 
    username = 'giualvess';

-- 6. Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
