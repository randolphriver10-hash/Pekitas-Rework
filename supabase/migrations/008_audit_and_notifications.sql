create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id),
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  table_name text not null,
  record_id text not null,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_table_record_idx on public.audit_logs (table_name, record_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- Trigger genérico de auditoría: se cuelga AFTER INSERT/UPDATE/DELETE de cualquier
-- tabla administrable y registra el actor, la acción y el diff completo.
create or replace function public.audit_trigger_fn()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  record_id_value text;
begin
  if tg_op = 'DELETE' then
    record_id_value := old.id::text;
  else
    record_id_value := new.id::text;
  end if;

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

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  is_read boolean not null default false,
  related_table text,
  related_id text,
  created_at timestamptz not null default now()
);

create index notifications_user_id_idx on public.notifications (user_id, is_read);
