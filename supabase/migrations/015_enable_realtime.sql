-- Habilita replicación de Realtime (postgres_changes) para las tablas que afectan
-- lo que se ve en la landing pública. El componente RealtimeWatcher del lado
-- cliente escucha estos cambios y hace router.refresh() — no confía en el payload
-- del evento en sí, solo lo usa como disparador para volver a pedir los datos al
-- servidor (que sí aplica RLS correctamente).
alter publication supabase_realtime add table
  site_settings,
  landing_sections,
  social_links,
  banners,
  categories,
  products,
  product_images,
  product_variants,
  promotions,
  promotion_products,
  testimonials,
  faqs,
  gallery_items;
