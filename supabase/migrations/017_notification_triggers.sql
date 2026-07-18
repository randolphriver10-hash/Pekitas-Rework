-- Notificaciones automáticas para el panel admin. Se guardan como broadcast
-- (user_id null) porque la policy "notifications_select_own_or_broadcast" ya
-- las hace visibles a cualquier usuario autenticado — no hace falta fan-out
-- por usuario, y evita duplicar filas por cada admin/editor.

create or replace function public.notify_new_newsletter_subscriber()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, related_table, related_id)
  values (
    null,
    'newsletter_signup',
    'Nueva suscripción al newsletter',
    new.email,
    'newsletter_subscribers',
    new.id::text
  );
  return new;
end;
$$;

create trigger on_newsletter_subscriber_created
  after insert on public.newsletter_subscribers
  for each row execute function public.notify_new_newsletter_subscriber();

-- Alerta de stock bajo: se dispara solo cuando el stock cruza el umbral hacia
-- abajo (evita spamear una notificación por cada guardado mientras ya está bajo).
create or replace function public.notify_low_stock_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'published' and new.stock <= 3 and (old.stock > 3 or old.stock is null) then
    insert into public.notifications (user_id, type, title, message, related_table, related_id)
    values (
      null,
      'low_stock',
      'Stock bajo: ' || new.name,
      'Quedan ' || new.stock || ' unidades.',
      'products',
      new.id::text
    );
  end if;
  return new;
end;
$$;

create trigger on_product_low_stock
  after update of stock on public.products
  for each row execute function public.notify_low_stock_product();

alter publication supabase_realtime add table notifications;
