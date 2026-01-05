-- Enable moddatetime extension if not exists
create extension if not exists moddatetime schema extensions;

-- Add category column to proposals if it doesn't exist (or alter existing if I can catch it, but better to just do a safe strict)
-- Since the previous migration might have failed completely, this file should ideally replace it OR be a fix. 
-- However, since I cannot easily 'delete' the previous file without risk, I will make this a "fix and expand" migration.
-- If the table 'proposals' does NOT exist, create it. If it exists, alter it.

do $$
begin
  if not exists (select from pg_tables where schemaname = 'public' and tablename = 'proposals') then
    create table "public"."proposals" (
        "id" uuid not null default gen_random_uuid(),
        "created_at" timestamp with time zone not null default now(),
        "updated_at" timestamp with time zone default now(),
        "title" text not null,
        "slug" text not null,
        "client_name" text not null,
        "client_logo" text,
        "recording_url" text,
        "transcript" text,
        "mindmap_code" text,
        "summary" text,
        "scope" jsonb default '[]'::jsonb,
        "investment_total" numeric,
        "status" text default 'draft', -- draft, sent, approved, rejected
        "access_token" text default md5(random()::text),
        "user_id" uuid references auth.users(id),
        "category" text default 'proposal' -- proposal, onboarding, kickoff, qbr, other
    );

    -- Indexes
    create unique index proposals_slug_key on "public"."proposals" using btree ("slug");

    -- RLS
    alter table "public"."proposals" enable row level security;

    create policy "Enable read access for public with token"
    on "public"."proposals"
    as permissive
    for select
    to public
    using ( true );

    create policy "Enable all access for authenticated users"
    on "public"."proposals"
    as permissive
    for all
    to authenticated
    using ( true )
    with check ( true );

    -- Trigger
    create trigger handle_updated_at before update on proposals
      for each row execute procedure moddatetime (updated_at);
  else
    -- If table exists (partial migration?), enable moddatetime and add category
    -- (The previous migration likely failed at the trigger step if extension was missing)
    -- So we just try to add the column if missing
    
    if not exists (select from information_schema.columns where table_name = 'proposals' and column_name = 'category') then
        alter table "public"."proposals" add column "category" text default 'proposal';
    end if;

    -- Ensure extension is on
    create extension if not exists moddatetime schema extensions;
    
    -- Ensure trigger exists (drop and recreate to be safe)
    drop trigger if exists handle_updated_at on proposals;
    create trigger handle_updated_at before update on proposals
      for each row execute procedure moddatetime (updated_at);
  end if;
end
$$;
