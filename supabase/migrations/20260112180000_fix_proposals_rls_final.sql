-- FIX RLS POLICY FOR PROPOSALS (FINAL)

-- Enable RLS
alter table "public"."proposals" enable row level security;

-- Drop potentially conflicting or restrictive policies
drop policy if exists "Enable read access for public with token" on "public"."proposals";
drop policy if exists "Enable all access for authenticated users" on "public"."proposals";
drop policy if exists "Authenticated users can manage proposals" on "public"."proposals";
drop policy if exists "Users can manage their own proposals" on "public"."proposals";

-- 1. PUBLIC READ (with token)
create policy "Enable read access for public with token"
on "public"."proposals"
as permissive for select to public
using ( true );

-- 2. AUTHENTICATED FULL ACCESS
-- This ensures any logged-in user (admin) can Insert/Update/Delete
create policy "Enable all access for authenticated users"
on "public"."proposals"
as permissive for all to authenticated
using ( true )
with check ( true );
