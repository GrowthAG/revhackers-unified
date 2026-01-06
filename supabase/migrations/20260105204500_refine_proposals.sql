-- Migration to add new strategic fields to proposals table
alter table "public"."proposals" 
add column if not exists "headline" text,
add column if not exists "subheadline" text,
add column if not exists "brief_explanation" text,
add column if not exists "mindmap_embed" text,
add column if not exists "detailed_scope" text,
add column if not exists "payment_terms" text;

-- Update RLS (Policies should already be permissive for public select and authenticated all, but let's be sure)
-- No changes needed if existing policies use 'for all' or 'for select' without column restrictions.
