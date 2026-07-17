# Pekitas Rework

Sistema completo de landing page + panel administrativo para **Pekitas Sumita**,
mayorista de moda infantil. El panel administra todo el contenido de la landing
(catálogo, promociones, testimonios, FAQs, galería, configuración del sitio) y los
cambios se reflejan en la landing pública **sin necesidad de redeploy**, con
sincronización en tiempo real vía Supabase Realtime cuando la landing está abierta.

## Tecnologías

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** sobre **Base UI** (no Radix — este proyecto usa el preset `base-nova`)
- **Supabase**: Postgres, Auth, Storage, Realtime
- **React Hook Form + Zod** para todos los formularios
- **date-fns-tz** para manejo de fechas en `America/Argentina/Buenos_Aires`
- **Vercel** para hosting

## Requisitos

- Node.js 20+
- Una cuenta de Vercel con el proyecto vinculado (`vercel link`)
- Una integración de Supabase provisionada vía Vercel Marketplace (`vercel integration add supabase`)

## Variables de entorno

Ver `.env.example`. Se documenta ahí cuáles son públicas (`NEXT_PUBLIC_*`, seguras de
exponer al navegador porque están protegidas por Row Level Security) y cuál es
privada (`SUPABASE_SECRET_KEY`, solo servidor, nunca debe tener prefijo `NEXT_PUBLIC_`).

Si Supabase se provisionó vía Vercel Marketplace, las variables ya están sincronizadas
en Vercel (Production/Preview/Development). Para desarrollo local:

```bash
vercel env pull .env.local
```

## Instalación y ejecución local

```bash
npm install
vercel env pull .env.local   # trae las credenciales reales de Supabase
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Base de datos

Las migraciones SQL están en `supabase/migrations/`, numeradas y aplicadas en orden.
No hace falta pegarlas a mano en el SQL Editor: hay un runner que las aplica vía
conexión directa a Postgres (usa `POSTGRES_URL_NON_POOLING`, que ya viene provisto
por la integración de Vercel Marketplace).

```bash
npm run db:migrate
```

El runner es idempotente — lleva registro de qué migraciones ya se aplicaron en la
tabla `public._migrations` y solo corre las nuevas.

### Qué crean las migraciones

- Esquema completo: `profiles`, `user_roles`, `site_settings`, `landing_sections`,
  `social_links`, `banners`, `categories`, `products`, `product_images`,
  `product_variants`, `promotions`, `promotion_products`, `testimonials`, `faqs`,
  `gallery_items`, `audit_logs`, `notifications`.
- Funciones `has_role()`, `is_staff()`, `is_admin()` para las políticas RLS.
- Trigger genérico de auditoría (`audit_trigger_fn`) colgado en todas las tablas
  administrables — cada INSERT/UPDATE/DELETE queda registrado en `audit_logs` con
  actor, diff completo y timestamp, sin que cada server action tenga que acordarse
  de loguearlo.
- **Row Level Security** en todas las tablas: lectura pública solo de contenido
  `published`/activo/no eliminado; escritura solo para `admin`/`editor`; acciones
  críticas (usuarios, borrado definitivo) solo `admin`. El costo de los productos
  (`products.cost`) está restringido a nivel de columna — la `anon` key ni siquiera
  puede seleccionarlo, no es solo una restricción de UI.
- Buckets de Storage (`product-images`, `site-assets`) con políticas: lectura
  pública, escritura solo staff autenticado.
- Realtime habilitado (`supabase_realtime` publication) en las tablas que afectan la
  landing pública.

### Storage

Los buckets se crean automáticamente por la migración `011_storage.sql`. No hace
falta configurar nada manualmente en el dashboard de Supabase.

## Crear el primer administrador

```bash
npm run create-admin
```

Pide email, contraseña y nombre de forma interactiva (o aceptá `ADMIN_EMAIL`,
`ADMIN_PASSWORD`, `ADMIN_NAME` como variables de entorno para uso no interactivo).
Crea el usuario en Supabase Auth y le asigna el rol `admin` en `user_roles`.

Para invitar más usuarios (admin o editor) después de tener el primero, usá el panel
en **Usuarios y permisos** — manda una invitación por email real, no hace falta correr
scripts.

## Migrar datos de un sistema anterior

`scripts/migrate-old-catalog.mts` es el script que se usó para traer el catálogo real
desde el sistema anterior (Pekitas-Sumita10). Es específico de esa migración puntual;
no hace falta volver a correrlo, queda como referencia.

## Ejecución de pruebas / verificación

El proyecto no tiene una suite de tests automatizados (no se pidió). La verificación
se hizo etapa por etapa con Playwright contra el entorno real (dev y producción):
login, RLS con la anon key, CRUD completo, sincronización en tiempo real entre dos
pestañas, responsive en mobile, y el flujo público como visitante anónimo sin sesión
(clave para detectar problemas de permisos que una sesión de admin activa enmascara).

## Estructura de carpetas

```
src/
  app/
    (site)/            landing pública (route group, layout propio con tipografía
                        editorial separada del admin)
    admin/              panel administrativo (protegido por proxy.ts + verificación
                        de rol en cada layout/página sensible)
    login/, auth/, forgot-password/, reset-password/   autenticación
    sitemap.ts, robots.ts   SEO técnico
  components/
    site/                componentes de la landing pública
    admin/                componentes compartidos del admin (sidebar, confirm dialog,
                        image uploader real a Supabase Storage, etc.)
    ui/                  shadcn/ui (Base UI)
  lib/
    supabase/            clientes (browser/server/admin) y tipos de la base
    validations/         schemas de Zod por dominio
    site-data.ts, catalog-data.ts, promotions.ts, banners-data.ts
                        data fetchers del lado público, con cache() de React para
                        deduplicar
    auth/                helpers de sesión/rol
scripts/
  run-migrations.mts, create-first-admin.mts, seed-content.mts,
  migrate-old-catalog.mts
supabase/migrations/     SQL, numerado y aplicado en orden
```

## Sincronización en tiempo real

Cuando un admin publica un cambio, dos mecanismos garantizan que se vea reflejado:

1. **Supabase Realtime**: si la landing está abierta en el navegador de un visitante,
   un componente invisible (`RealtimeWatcher`) escucha cambios en las tablas
   administrables vía `postgres_changes` y llama `router.refresh()` (con debounce) —
   Next vuelve a ejecutar los Server Components y trae datos frescos respetando RLS,
   sin recargar la página.
2. **`revalidatePath`**: cada server action de mutación revalida la ruta pública
   correspondiente como red de seguridad adicional.

Si Realtime falla temporalmente (red, límite de conexiones), la landing sigue
funcionando normalmente — el visitante ve los datos actualizados en su próxima
navegación o recarga, no se rompe nada.

## Despliegue

El proyecto está conectado a GitHub — cada push a `main` dispara un deploy en
Vercel. Para desplegar manualmente:

```bash
vercel --prod
```

## Solución de problemas frecuentes

**"permission denied for table X" con la anon key**: alguna columna nueva que se usa
en un filtro (`.eq()`, `.is()`) no está en el GRANT de columnas de `products` a
`anon` (ver migración `010_rls_policies.sql` y el fix en `014`). Esto pasa porque
Postgres exige privilegio SELECT sobre una columna aunque solo se use en el WHERE, no
en el resultado. Si agregás un filtro nuevo sobre `products`, revisá que la columna
esté en ese GRANT.

**Un `<Select>` del admin muestra el valor crudo en vez de la etiqueta**: este
proyecto usa Base UI (no Radix). El componente `Select` necesita el prop `items`
(mapa de value → label) para poder resolver la etiqueta antes de que el usuario abra
el dropdown por primera vez — sin eso, `<Select.Value>` no tiene de dónde sacar el
texto. Ver cualquier diálogo existente (`promotion-dialog.tsx`, `category-dialog.tsx`)
como referencia del patrón.

**Falla el runner de migraciones con error de certificado SSL**: típico de un
antivirus/proxy local interceptando TLS. El script ya fuerza `sslmode=no-verify` en
la connection string por esto — si sigue fallando, revisá que
`POSTGRES_URL_NON_POOLING` esté presente en `.env.local`.

**El botón/link de un formulario tira un warning de `nativeButton`**: pasa cuando un
`<Button render={<Link .../>}>` apunta a un elemento que no es un `<button>` nativo.
Agregá `nativeButton={false}`.

## Cuentas de prueba

Durante el desarrollo se usó una cuenta QA (`qa-temp@pekitas.test`) para las pruebas
automatizadas. Se recomienda revocarle el acceso desde **Usuarios y permisos** una
vez que el administrador real esté creado.

## Seguridad

- El repo anterior (`Pekitas-Sumita10`) tenía un `.env` committeado públicamente en
  GitHub con credenciales reales. Ese proyecto Supabase quedó completamente
  abandonado — este sistema usa un proyecto Supabase nuevo, sin relación. Si esas
  claves viejas seguían activas, se recomienda rotarlas o eliminar ese proyecto.
- `SUPABASE_SECRET_KEY` nunca se expone al navegador — solo se usa en Server Actions
  y Route Handlers (`src/lib/supabase/admin.ts`, protegido con el paquete
  `server-only`).
