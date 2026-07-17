create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  icon text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_sort_order_idx on public.categories (sort_order);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text unique,
  short_description text,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  sale_price numeric(12, 2) check (sale_price is null or sale_price >= 0),
  cost numeric(12, 2) check (cost is null or cost >= 0),
  category_id uuid references public.categories (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden', 'agotado', 'archived')),
  stock integer not null default 0 check (stock >= 0),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_on_sale boolean not null default false,
  sale_start_at timestamptz,
  sale_end_at timestamptz,
  material text,
  tags text[] not null default '{}',
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  constraint products_sale_date_range check (sale_end_at is null or sale_start_at is null or sale_end_at >= sale_start_at)
);

create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create index products_category_id_idx on public.products (category_id);
create index products_status_idx on public.products (status);
create index products_sort_order_idx on public.products (sort_order);
create index products_name_trgm_idx on public.products using gin (to_tsvector('spanish', name));

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt_text text not null default '',
  title text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index product_images_product_id_idx on public.product_images (product_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text,
  color text,
  sku text,
  stock integer not null default 0 check (stock >= 0),
  extra_price numeric(12, 2) not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create trigger set_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

create index product_variants_product_id_idx on public.product_variants (product_id);
