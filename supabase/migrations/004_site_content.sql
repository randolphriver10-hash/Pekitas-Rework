-- Fila única con la información general del negocio, WhatsApp y SEO global.
create table public.site_settings (
  id boolean primary key default true,
  business_name text not null default 'Pekitas',
  logo_url text,
  favicon_url text,
  description text,
  address text,
  phone text,
  whatsapp_number text,
  whatsapp_message_template text default 'Hola! Quería consultar por {product_name} ({product_url}).',
  email text,
  hours jsonb not null default '{}'::jsonb,
  maps_url text,
  catalog_url text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  seo_image_url text,
  seo_canonical_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id),
  constraint site_settings_singleton check (id)
);

insert into public.site_settings (id) values (true);

create trigger set_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Secciones editables de la landing (hero, beneficios, sobre nosotros, contacto, footer...).
create table public.landing_sections (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  content jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
  scheduled_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  unique (type)
);

create trigger set_landing_sections_updated_at
  before update on public.landing_sections
  for each row execute function public.set_updated_at();

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_social_links_updated_at
  before update on public.social_links
  for each row execute function public.set_updated_at();

-- Avisos/banners superiores y promocionales (posición configurable).
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  message text not null,
  cta_text text,
  cta_url text,
  image_url text,
  position text not null default 'top' check (position in ('top', 'hero', 'footer')),
  is_active boolean not null default true,
  status text not null default 'draft' check (status in ('draft', 'published', 'scheduled', 'archived')),
  start_at timestamptz,
  end_at timestamptz,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  constraint banners_date_range check (end_at is null or start_at is null or end_at >= start_at)
);

create trigger set_banners_updated_at
  before update on public.banners
  for each row execute function public.set_updated_at();

create index banners_sort_order_idx on public.banners (sort_order);
