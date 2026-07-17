create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed_price')),
  discount_percentage numeric(5, 2) check (discount_percentage is null or (discount_percentage > 0 and discount_percentage <= 100)),
  fixed_price numeric(12, 2) check (fixed_price is null or fixed_price >= 0),
  category_id uuid references public.categories (id) on delete set null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_active boolean not null default true,
  show_countdown boolean not null default false,
  banner_enabled boolean not null default false,
  banner_position text default 'hero' check (banner_position in ('top', 'hero', 'footer')),
  cta_text text,
  cta_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id),
  constraint promotions_date_range check (end_at >= start_at),
  constraint promotions_discount_shape check (
    (discount_type = 'percentage' and discount_percentage is not null and fixed_price is null) or
    (discount_type = 'fixed_price' and fixed_price is not null and discount_percentage is null)
  )
);

create trigger set_promotions_updated_at
  before update on public.promotions
  for each row execute function public.set_updated_at();

create index promotions_active_window_idx on public.promotions (start_at, end_at) where deleted_at is null;

create table public.promotion_products (
  promotion_id uuid not null references public.promotions (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (promotion_id, product_id)
);
