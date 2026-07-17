import { ShieldAlert } from "lucide-react";
import { getCurrentStaff } from "@/lib/auth/current-staff";
import { createClient } from "@/lib/supabase/server";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuditLogTable } from "@/app/admin/historial/audit-log-table";
import { TrashList, type TrashItem } from "@/app/admin/historial/trash-list";
import type { TrashTable } from "@/app/admin/historial/actions";

const TRASH_CONFIG: { table: TrashTable; label: string; nameField: string }[] = [
  { table: "products", label: "Producto", nameField: "name" },
  { table: "categories", label: "Categoría", nameField: "name" },
  { table: "promotions", label: "Promoción", nameField: "name" },
  { table: "testimonials", label: "Testimonio", nameField: "customer_name" },
  { table: "faqs", label: "Pregunta frecuente", nameField: "question" },
  { table: "gallery_items", label: "Imagen de galería", nameField: "alt_text" },
  { table: "banners", label: "Banner", nameField: "message" },
];

export default async function HistoryPage() {
  const staff = await getCurrentStaff();

  if (staff?.role !== "admin") {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ShieldAlert />
          </EmptyMedia>
          <EmptyTitle>No autorizado</EmptyTitle>
          <EmptyDescription>El historial completo es exclusivo para administradores.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const supabase = await createClient();

  const [{ data: auditLogs }, ...trashResults] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    ...TRASH_CONFIG.map((cfg) =>
      supabase
        .from(cfg.table)
        .select(`id, deleted_at, deleted_by, ${cfg.nameField}`)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false })
    ),
  ]);

  const actorIds = new Set<string>();
  for (const log of auditLogs ?? []) if (log.actor_id) actorIds.add(log.actor_id);
  for (const result of trashResults) {
    for (const row of (result.data ?? []) as unknown as { deleted_by: string | null }[]) {
      if (row.deleted_by) actorIds.add(row.deleted_by);
    }
  }

  const { data: profiles } =
    actorIds.size > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", [...actorIds])
      : { data: [] };
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? "Staff"]));

  const trashItems: TrashItem[] = trashResults.flatMap((result, i) => {
    const cfg = TRASH_CONFIG[i];
    return ((result.data ?? []) as unknown as Record<string, unknown>[]).map((row) => ({
      table: cfg.table,
      typeLabel: cfg.label,
      id: row.id as string,
      name: String(row[cfg.nameField] ?? "(sin nombre)"),
      deletedAt: row.deleted_at as string,
      deletedByName: row.deleted_by ? (nameById.get(row.deleted_by as string) ?? "Staff") : "—",
    }));
  });
  trashItems.sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

  const auditWithNames = (auditLogs ?? []).map((log) => ({
    ...log,
    actorName: log.actor_id ? (nameById.get(log.actor_id) ?? "Staff") : "Sistema",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Historial de cambios</h1>
        <p className="text-muted-foreground text-sm">Auditoría completa y papelera de contenido eliminado.</p>
      </div>

      <Tabs defaultValue="actividad">
        <TabsList>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
          <TabsTrigger value="papelera">Papelera ({trashItems.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="actividad">
          <AuditLogTable logs={auditWithNames} />
        </TabsContent>
        <TabsContent value="papelera">
          <TrashList items={trashItems} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
