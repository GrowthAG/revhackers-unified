-- Migration: Secure Proposals Access via RPC
-- Data: 2026-01-14
-- Description: Replaces direct public table access (which was too permissive) with a strictly typed RPC function.

-- 1. Create the Secure RPC Function
-- This function runs with 'security definer' privileges (admin) but only returns the specific proposal matching the slug.
CREATE OR REPLACE FUNCTION public.get_proposal_by_slug(slug_input text)
RETURNS SETOF public.proposals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.proposals
  WHERE slug = slug_input;
END;
$$;

-- 2. Grant Access to Public/Anon
GRANT EXECUTE ON FUNCTION public.get_proposal_by_slug(text) TO public;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_slug(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_proposal_by_slug(text) TO authenticated;

-- 3. LOCK DOWN the 'proposals' table
-- We drop the overly permissive policy created in '20260112180000_fix_proposals_rls_final.sql'
DROP POLICY IF EXISTS "Enable read access for public with token" ON public.proposals;

-- Ensure only Authenticated (Admins) can access the table directly now
-- "Enable all access for authenticated users" should typically remain for the Admin Panel to work
-- (Assuming Admin Panel uses authenticated role)

-- Double check: If there are no other policies for public, default is deny.
-- This effectively blocks 'select * from proposals' from the public client.
