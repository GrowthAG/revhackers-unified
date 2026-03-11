-- Migration: Allow public access for diagnostic results
-- Purpose: Enable lead generation without requiring user login

-- 1. Modify rei_projects to allow optional project_id in rei_responses or similar
-- Actually, let's just allow anonymous INSERT into both tables for diagnostics

-- 2. Adjust RLS for rei_projects (Lead Creation)
DROP POLICY IF EXISTS "Enable public insert for diagnostic leads" ON public.rei_projects;
CREATE POLICY "Enable public insert for diagnostic leads"
ON public.rei_projects FOR INSERT
TO anon
WITH CHECK (true);

-- 3. Adjust RLS for rei_responses (Diagnostic Submission)
DROP POLICY IF EXISTS "Enable public insert for diagnostic responses" ON public.rei_responses;
CREATE POLICY "Enable public insert for diagnostic responses"
ON public.rei_responses FOR INSERT
TO anon
WITH CHECK (true);

-- 4. Adjust RLS for rei_responses (Viewing Result via Link)
DROP POLICY IF EXISTS "Enable public view for diagnostic results" ON public.rei_responses;
CREATE POLICY "Enable public view for diagnostic results"
ON public.rei_responses FOR SELECT
TO anon
USING (true);

-- 5. Extend rei_projects to support lead gen metadata if needed
-- (It already has client_name, client_email which is enough)
