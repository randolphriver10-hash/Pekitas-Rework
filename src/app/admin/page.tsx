import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Activity, ImageOff, PackageX, ShoppingBag, Tag, Users2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";

const TZ = "America/Argentina/Buenos_Aires";

async function getDashboardData() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [
    productsTotal,
    productsPublished,
    productsOutOfStock,
    productsNoImage,
    categoriesActive,
    promotionsActive,
    testimonialsPublished,
    recentAudit,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("stock", 0)
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("id, product_images!left(id)")
      .is("deleted_at", null)
      .is("product_images.id", null)
      .limit(1000),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .is("deleted_at", null),
    supabase
      .from("promotions")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .eq("is_active", true)
      .is("deleted_at", null)
      .lte("start_at", nowIso)
      .gte("end_at", nowIso),
    supabase
      .from("testimonials")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .is("deleted_at", null),
    supabase
      .from("audit_logs")
      .select("id, action, table_name, record_id, created_at, actor_id")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  let actorNames: Record<string, string> = {};
  const actorIds = [...new Set((recentAudit.data ?? []).map((a) => a.actor_id).filter(Boolean))] as string[];
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", actorIds);
    actorNames = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.full_name ?? "Staff"]));
  }

  return {
    productsTotal: productsTotal.count ?? 0,
    productsPublished: productsPublished.count ?? 0,
    productsOutOfStock: productsOutOfStock.count ?? 0,
    productsNoImage: productsNoImage.data?.length ?? 0,
    categoriesActive: categoriesActive.count ?? 0,
    promotionsActive: promotionsActive.count ?? 0,
    testimonialsPublished: testimonialsPublished.count ?? 0,
    recentAudit: (recentAudit.data ?? []).map((a) => ({
      ...a,
      actorName: a.actor_id ? (actorNames[a.actor_id] ?? "Staff") : "Sistema",
    })),
  };
}

const actionLabel: Record<string, string> = {
  INSERT: "creó",
  UPDATE: "actualizó",
  DELETE: "eliminó",
};

const tableLabel: Record<string, string> = {
  products: "un producto",
  categories: "una categoría",
  promotions: "una promoción",
  testimonials: "un testimonio",
  faqs: "una pregunta frecuente",
  gallery_items: "un elemento de galería",
  banners: "un banner",
  landing_sections: "una sección de la landing",
  site_settings: "la configuración del sitio",
  social_links: "una red social",
  product_images: "una imagen de producto",
  product_variants: "una variante",
  user_roles: "un permiso de usuario",
};

export default async function AdminDashboardPage() {
  const [staff, data] = await Promise.all([getCurrentStaff(), getDashboardData()]);

  const cards = [
    { label: "Productos totales", value: data.productsTotal, icon: ShoppingBag, href: "/admin/productos" },
    { label: "Productos publicados", value: data.productsPublished, icon: Activity, href: "/admin/productos" },
    { label: "Sin stock", value: data.productsOutOfStock, icon: PackageX, href: "/admin/productos" },
    { label: "Sin imagen", value: data.productsNoImage, icon: ImageOff, href: "/admin/productos" },
    { label: "Categorías activas", value: data.categoriesActive, icon: Tag, href: "/admin/categorias" },
    { label: "Promociones vigentes", value: data.promotionsActive, icon: Tag, href: "/admin/promociones" },
    { label: "Testimonios publicados", value: data.testimonialsPublished, icon: Users2, href: "/admin/testimonios" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Hola, {staff?.fullName || staff?.email}
        </h1>
        <p className="text-muted-foreground text-sm">Resumen general del sistema.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href}>
              <Card className="hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardDescription>{card.label}</CardDescription>
                  <Icon className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">{card.value}</div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {(data.productsOutOfStock > 0 || data.productsNoImage > 0) && (
        <Card className="border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardHeader>
            <CardTitle className="text-base">Alertas</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-1 text-sm">
            {data.productsOutOfStock > 0 && <p>{data.productsOutOfStock} producto(s) sin stock.</p>}
            {data.productsNoImage > 0 && <p>{data.productsNoImage} producto(s) sin imagen cargada.</p>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actividad reciente</CardTitle>
          <CardDescription>
            {staff?.role === "editor"
              ? "El historial completo es solo para administradores."
              : "Últimos cambios registrados en el sistema."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentAudit.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Activity />
                </EmptyMedia>
                <EmptyTitle>Sin actividad todavía</EmptyTitle>
                <EmptyDescription>
                  Los cambios que hagas en el panel van a aparecer acá.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y">
              {data.recentAudit.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    <span className="font-medium">{entry.actorName}</span>{" "}
                    <span className="text-muted-foreground">
                      {actionLabel[entry.action] ?? entry.action}{" "}
                      {tableLabel[entry.table_name] ?? entry.table_name}
                    </span>
                  </span>
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {formatInTimeZone(entry.created_at, TZ, "d MMM, HH:mm", { locale: es })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
