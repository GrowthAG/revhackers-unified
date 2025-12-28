-- Create buckets if they don't exist
insert into storage.buckets (id, name, public)
values ('blog-covers', 'blog-covers', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('lovable-uploads', 'lovable-uploads', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Policy: Public Read Access (Drop existing to avoid conflict if any)
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('blog-covers', 'lovable-uploads') );

-- Policy: Authenticated Insert (Allow any authenticated user to upload)
drop policy if exists "Authenticated Upload" on storage.objects;
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id in ('blog-covers', 'lovable-uploads') );

-- Policy: Authenticated Update
drop policy if exists "Authenticated Update" on storage.objects;
create policy "Authenticated Update"
  on storage.objects for update
  to authenticated
  using ( bucket_id in ('blog-covers', 'lovable-uploads') );

-- Policy: Authenticated Delete
drop policy if exists "Authenticated Delete" on storage.objects;
create policy "Authenticated Delete"
  on storage.objects for delete
  to authenticated
  using ( bucket_id in ('blog-covers', 'lovable-uploads') );
