create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  segment text check (segment in ('bebes', 'ninas', 'ninos', 'general')) default 'general',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index newsletter_subscribers_created_at_idx on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Cualquiera puede suscribirse (es un form público), nadie puede leer la lista
-- salvo staff — evita que se pueda scrapear la lista de emails vía la anon key.
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);

create policy "newsletter_staff_read" on public.newsletter_subscribers
  for select using (public.is_staff());

create policy "newsletter_staff_update" on public.newsletter_subscribers
  for update using (public.is_staff()) with check (public.is_staff());

create policy "newsletter_admin_delete" on public.newsletter_subscribers
  for delete using (public.is_admin());

alter publication supabase_realtime add table newsletter_subscribers;
