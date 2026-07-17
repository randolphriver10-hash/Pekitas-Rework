-- Extensiones necesarias.
create extension if not exists pgcrypto with schema extensions;

-- Trigger genérico: mantiene updated_at al día en cualquier tabla que lo tenga.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
