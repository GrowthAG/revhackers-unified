-- CONSOLIDATED MIGRATION: PROPOSALS V3 + CRM INTEGRATION
-- Target: 'proposals' table

-- Enable moddatetime extension if not enabled
create extension if not exists moddatetime;

-- Create table if not exists (or recreate if you want to be safe, but let's use IF NOT EXISTS logic)
create table if not exists "public"."proposals" (
    "id" uuid not null default gen_random_uuid() primary key,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "title" text not null,
    "slug" text not null unique,
    "client_name" text,
    "client_contact_name" text,
    "client_email" text,
    "client_logo" text,
    "recording_url" text,
    "transcript" text,
    
    -- Layout V3 Strategic Fields
    "headline" text,
    "subheadline" text,
    "brief_explanation" text,
    "detailed_scope" text,
    "payment_terms" text,
    "mindmap_code" text,
    "mindmap_embed" text,
    
    -- AI Generated Insights & CRM Data (NEW)
    "summary" text,
    "investment_total" text,
    "setup_fee" text,
    "installment_value" text,
    "crm_data" jsonb default '{}'::jsonb, -- Treated data for CRM (Pain points, Budget, Authority, etc)
    
    "status" text default 'draft',
    "access_token" text default md5(random()::text),
    "user_id" uuid references auth.users(id)
);

-- RLS Policies
alter table "public"."proposals" enable row level security;

drop policy if exists "Enable read access for public with token" on "public"."proposals";
create policy "Enable read access for public with token"
on "public"."proposals"
as permissive for select to public
using ( true );

drop policy if exists "Enable all access for authenticated users" on "public"."proposals";
create policy "Enable all access for authenticated users"
on "public"."proposals"
as permissive for all to authenticated
using ( true )
with check ( true );

-- Trigger for update
drop trigger if exists handle_updated_at on proposals;
create trigger handle_updated_at before update on proposals
  for each row execute procedure moddatetime (updated_at);
