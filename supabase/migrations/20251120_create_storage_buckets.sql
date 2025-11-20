insert into storage.buckets (id, name, public) values ('websites', 'websites', false) on conflict (id) do nothing;

alter table storage.objects enable row level security;

drop policy if exists websites_select_own on storage.objects;
drop policy if exists websites_insert_own on storage.objects;
drop policy if exists websites_update_own on storage.objects;
drop policy if exists websites_delete_own on storage.objects;

create policy websites_select_own on storage.objects for select using (bucket_id = 'websites' and owner = auth.uid());
create policy websites_insert_own on storage.objects for insert with check (bucket_id = 'websites' and owner = auth.uid());
create policy websites_update_own on storage.objects for update using (bucket_id = 'websites' and owner = auth.uid());
create policy websites_delete_own on storage.objects for delete using (bucket_id = 'websites' and owner = auth.uid());