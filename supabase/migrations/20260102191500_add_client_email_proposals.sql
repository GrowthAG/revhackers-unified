
-- Add client_email column to proposals table
do $$
begin
    if not exists (select from information_schema.columns where table_name = 'proposals' and column_name = 'client_email') then
        alter table "public"."proposals" add column "client_email" text;
    end if;
end $$;
