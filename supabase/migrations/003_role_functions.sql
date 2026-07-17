-- Devuelve true si el usuario autenticado actual tiene el rol pedido.
create or replace function public.has_role(check_role text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = check_role
  );
$$;

-- true si el usuario logueado es admin o editor (cualquier miembro del staff).
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.user_roles where user_id = auth.uid()
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.has_role('admin');
$$;
