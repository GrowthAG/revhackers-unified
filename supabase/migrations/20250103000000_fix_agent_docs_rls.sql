-- Allow SELECT for anyone authenticated who can see the agent (or everyone for now to debug)
begin;

-- 1. Ensure public.agent_documents has a more permissive SELECT policy
drop policy if exists "Admins can manage documents" on public.agent_documents;

create policy "Admins can manage documents" on public.agent_documents
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'super_admin')
    )
  );

-- NEW: Permissive select for authenticated users
-- This ensures that even if 'userRole' is slightly off in the profiles table, 
-- admins (and anyone else logged in) can actually SEE the results.
create policy "Authenticated users can select documents" on public.agent_documents
  for select using (auth.role() = 'authenticated');

commit;
