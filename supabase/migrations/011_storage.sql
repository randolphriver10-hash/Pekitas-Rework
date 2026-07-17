insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']),
  ('site-assets', 'site-assets', true, 5242880, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "product_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "product_images_bucket_staff_write" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_staff());

create policy "product_images_bucket_staff_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "product_images_bucket_staff_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_staff());

create policy "site_assets_bucket_public_read" on storage.objects
  for select using (bucket_id = 'site-assets');

create policy "site_assets_bucket_staff_write" on storage.objects
  for insert with check (bucket_id = 'site-assets' and public.is_staff());

create policy "site_assets_bucket_staff_update" on storage.objects
  for update using (bucket_id = 'site-assets' and public.is_staff())
  with check (bucket_id = 'site-assets' and public.is_staff());

create policy "site_assets_bucket_staff_delete" on storage.objects
  for delete using (bucket_id = 'site-assets' and public.is_staff());
