-- La restricción de columnas sobre products (para ocultar `cost` a anon, migración
-- 010) se armó listando explícitamente las columnas permitidas y se olvidó
-- `deleted_at`. Postgres exige privilegio SELECT sobre una columna aunque solo se
-- use en un WHERE (no en el resultado), así que cualquier query pública que filtre
-- por `deleted_at is null` (todas) fallaba con "permission denied" para visitantes
-- anónimos reales. Se detectó porque las pruebas quedaron con sesión de admin
-- activa, que sí tiene acceso completo y enmascaró el problema.
grant select (deleted_at) on public.products to anon;
