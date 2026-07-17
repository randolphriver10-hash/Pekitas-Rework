create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  content text not null,
  rating integer check (rating between 1 and 5),
  photo_url text,
  testimonial_date date not null default current_date,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create trigger set_testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create trigger set_faqs_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null default '',
  title text,
  description text,
  related_product_id uuid references public.products (id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  deleted_at timestamptz,
  deleted_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create trigger set_gallery_items_updated_at
  before update on public.gallery_items
  for each row execute function public.set_updated_at();
