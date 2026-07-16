-- Ensure 'role' column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Ensure there is at least one super_admin (You!)
-- Replace the email below with your email if you want to be auto-promoted, 
-- or you can do it via the dashboard.
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'giulliano@revhackers.com.br'; -- Adjust if your email is different in the DB, e.g. stored in auth.users
-- Note: 'email' might not be in 'profiles' by default, it's usually in 'auth.users'.
-- We might need a trigger to copy email to profiles if we want to query it easily.
-- Let's check if we added personal_email. We did. But login email is in auth.users.

-- To make User Management easy, let's copy auth.email to profiles.email if feasible, 
-- otherwise we rely on 'personal_email' or a join (which Supabase restricts).

-- Recommended: Add 'email' to profiles and sync it via trigger.
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Trigger to sync email on auth.users insert (Standard Supabase Pattern)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user', 'pending');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- (Re)create trigger (optional, usually setup at project start)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Backfill email from auth.users (Requires permissions, helpful if running in dashboard)
-- UPDATE public.profiles p
-- SET email = u.email
-- FROM auth.users u
-- WHERE p.id = u.id AND p.email IS NULL;
