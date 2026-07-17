-- =========================================================================
-- Row Level Security. Convención general:
--   - Lectura pública (anon + authenticated sin rol): solo status='published'
--     (o is_active=true donde no hay status) y deleted_at is null.
--   - Staff (is_staff(): admin o editor) lee y escribe todo, incluida la
--     papelera y los borradores.
--   - El borrado definitivo (DELETE real, no soft-delete) es admin-only.
--   - user_roles / gestión de usuarios: admin-only en todo.
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.site_settings enable row level security;
alter table public.landing_sections enable row level security;
alter table public.social_links enable row level security;
alter table public.banners enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.promotions enable row level security;
alter table public.promotion_products enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.gallery_items enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- ---------------------------------------------------------------- profiles
create policy "profiles_select_own_or_staff" on public.profiles
  for select using (id = auth.uid() or public.is_staff());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- --------------------------------------------------------------- user_roles
create policy "user_roles_admin_all" on public.user_roles
  for all using (public.is_admin()) with check (public.is_admin());

create policy "user_roles_select_own" on public.user_roles
  for select using (user_id = auth.uid());

-- ------------------------------------------------------------ site_settings
create policy "site_settings_public_read" on public.site_settings
  for select using (true);

create policy "site_settings_staff_update" on public.site_settings
  for update using (public.is_staff()) with check (public.is_staff());

-- --------------------------------------------------------- landing_sections
create policy "landing_sections_public_read" on public.landing_sections
  for select using (status = 'published' and is_active);

create policy "landing_sections_staff_read" on public.landing_sections
  for select using (public.is_staff());

create policy "landing_sections_staff_write" on public.landing_sections
  for insert with check (public.is_staff());

create policy "landing_sections_staff_update" on public.landing_sections
  for update using (public.is_staff()) with check (public.is_staff());

create policy "landing_sections_admin_delete" on public.landing_sections
  for delete using (public.is_admin());

-- ------------------------------------------------------------- social_links
create policy "social_links_public_read" on public.social_links
  for select using (is_active);

create policy "social_links_staff_read" on public.social_links
  for select using (public.is_staff());

create policy "social_links_staff_write" on public.social_links
  for insert with check (public.is_staff());

create policy "social_links_staff_update" on public.social_links
  for update using (public.is_staff()) with check (public.is_staff());

create policy "social_links_staff_delete" on public.social_links
  for delete using (public.is_staff());

-- ------------------------------------------------------------------ banners
create policy "banners_public_read" on public.banners
  for select using (
    status = 'published' and is_active and deleted_at is null
    and (start_at is null or start_at <= now())
    and (end_at is null or end_at >= now())
  );

create policy "banners_staff_read" on public.banners
  for select using (public.is_staff());

create policy "banners_staff_write" on public.banners
  for insert with check (public.is_staff());

create policy "banners_staff_update" on public.banners
  for update using (public.is_staff()) with check (public.is_staff());

create policy "banners_admin_delete" on public.banners
  for delete using (public.is_admin());

-- --------------------------------------------------------------- categories
create policy "categories_public_read" on public.categories
  for select using (is_active and deleted_at is null);

create policy "categories_staff_read" on public.categories
  for select using (public.is_staff());

create policy "categories_staff_write" on public.categories
  for insert with check (public.is_staff());

create policy "categories_staff_update" on public.categories
  for update using (public.is_staff()) with check (public.is_staff());

create policy "categories_admin_delete" on public.categories
  for delete using (public.is_admin());

-- ----------------------------------------------------------------- products
create policy "products_public_read" on public.products
  for select using (status = 'published' and deleted_at is null);

create policy "products_staff_read" on public.products
  for select using (public.is_staff());

create policy "products_staff_write" on public.products
  for insert with check (public.is_staff());

create policy "products_staff_update" on public.products
  for update using (public.is_staff()) with check (public.is_staff());

create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- El costo es información interna: se revoca a nivel columna para anon.
revoke select on public.products from anon;
grant select (
  id, name, slug, sku, short_description, description, price, sale_price,
  category_id, status, stock, is_featured, is_new, is_on_sale,
  sale_start_at, sale_end_at, material, tags, sort_order, seo_title,
  seo_description, created_at, updated_at
) on public.products to anon;

-- ----------------------------------------------------------- product_images
create policy "product_images_public_read" on public.product_images
  for select using (
    is_active and exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.status = 'published' and p.deleted_at is null
    )
  );

create policy "product_images_staff_all" on public.product_images
  for all using (public.is_staff()) with check (public.is_staff());

-- --------------------------------------------------------- product_variants
create policy "product_variants_public_read" on public.product_variants
  for select using (
    is_active and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id and p.status = 'published' and p.deleted_at is null
    )
  );

create policy "product_variants_staff_all" on public.product_variants
  for all using (public.is_staff()) with check (public.is_staff());

-- ---------------------------------------------------------------promotions
create policy "promotions_public_read" on public.promotions
  for select using (
    status = 'published' and is_active and deleted_at is null
    and start_at <= now() and end_at >= now()
  );

create policy "promotions_staff_read" on public.promotions
  for select using (public.is_staff());

create policy "promotions_staff_write" on public.promotions
  for insert with check (public.is_staff());

create policy "promotions_staff_update" on public.promotions
  for update using (public.is_staff()) with check (public.is_staff());

create policy "promotions_admin_delete" on public.promotions
  for delete using (public.is_admin());

create policy "promotion_products_public_read" on public.promotion_products
  for select using (
    exists (
      select 1 from public.promotions pr
      where pr.id = promotion_products.promotion_id
        and pr.status = 'published' and pr.is_active and pr.deleted_at is null
        and pr.start_at <= now() and pr.end_at >= now()
    )
  );

create policy "promotion_products_staff_all" on public.promotion_products
  for all using (public.is_staff()) with check (public.is_staff());

-- ------------------------------------------------------------- testimonials
create policy "testimonials_public_read" on public.testimonials
  for select using (status = 'published' and deleted_at is null);

create policy "testimonials_staff_read" on public.testimonials
  for select using (public.is_staff());

create policy "testimonials_staff_write" on public.testimonials
  for insert with check (public.is_staff());

create policy "testimonials_staff_update" on public.testimonials
  for update using (public.is_staff()) with check (public.is_staff());

create policy "testimonials_admin_delete" on public.testimonials
  for delete using (public.is_admin());

-- -------------------------------------------------------------------- faqs
create policy "faqs_public_read" on public.faqs
  for select using (is_active and deleted_at is null);

create policy "faqs_staff_read" on public.faqs
  for select using (public.is_staff());

create policy "faqs_staff_write" on public.faqs
  for insert with check (public.is_staff());

create policy "faqs_staff_update" on public.faqs
  for update using (public.is_staff()) with check (public.is_staff());

create policy "faqs_admin_delete" on public.faqs
  for delete using (public.is_admin());

-- ----------------------------------------------------------- gallery_items
create policy "gallery_items_public_read" on public.gallery_items
  for select using (is_active and deleted_at is null);

create policy "gallery_items_staff_read" on public.gallery_items
  for select using (public.is_staff());

create policy "gallery_items_staff_write" on public.gallery_items
  for insert with check (public.is_staff());

create policy "gallery_items_staff_update" on public.gallery_items
  for update using (public.is_staff()) with check (public.is_staff());

create policy "gallery_items_admin_delete" on public.gallery_items
  for delete using (public.is_admin());

-- ------------------------------------------------------------- audit_logs
create policy "audit_logs_admin_read" on public.audit_logs
  for select using (public.is_admin());

-- Sin policies de insert/update/delete para el rol authenticated/anon:
-- solo el trigger (security definer) puede escribir acá.

-- ----------------------------------------------------------- notifications
create policy "notifications_select_own_or_broadcast" on public.notifications
  for select using (user_id = auth.uid() or user_id is null);

create policy "notifications_staff_insert" on public.notifications
  for insert with check (public.is_staff());

create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
