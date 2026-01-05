-- Add financial breakdown fields to proposals table
alter table "public"."proposals" 
add column if not exists "setup_fee" numeric,
add column if not exists "installment_value" numeric;
