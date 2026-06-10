insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product-images public read" on storage.objects;
create policy "product-images public read"
on storage.objects for select
to public
using (bucket_id = 'product-images');

drop policy if exists "product-images service write" on storage.objects;
create policy "product-images service write"
on storage.objects for all
to service_role
using (bucket_id = 'product-images')
with check (bucket_id = 'product-images');
