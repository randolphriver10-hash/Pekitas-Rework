-- user_roles no tiene columna `id` (su PK es user_id), así que el acceso estático
-- new.id/old.id rompe la compilación del trigger para esa tabla. Se extrae el id
-- dinámicamente vía jsonb, con fallback a user_id.
create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_id_value text;
  row_json jsonb;
begin
  row_json := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  record_id_value := coalesce(row_json ->> 'id', row_json ->> 'user_id');

  insert into public.audit_logs (actor_id, action, table_name, record_id, old_data, new_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    record_id_value,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
