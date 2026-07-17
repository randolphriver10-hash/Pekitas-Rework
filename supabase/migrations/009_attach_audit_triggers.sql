do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'landing_sections', 'social_links', 'banners',
    'categories', 'products', 'product_images', 'product_variants',
    'promotions', 'promotion_products',
    'testimonials', 'faqs', 'gallery_items',
    'user_roles'
  ]
  loop
    execute format(
      'create trigger %I_audit after insert or update or delete on public.%I
         for each row execute function public.audit_trigger_fn();',
      t, t
    );
  end loop;
end;
$$;
