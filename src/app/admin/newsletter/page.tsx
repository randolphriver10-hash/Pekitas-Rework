import Link from "next/link";
import { Download, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { AR_TZ } from "@/lib/timezone";

const segmentLabel: Record<string, string> = {
  bebes: "Bebés",
  ninas: "Niñas",
  ninos: "Niños",
  general: "General",
};

export default async function NewsletterPage() {
  const supabase = await createClient();
  const { data: subscribers, count } = await supabase
    .from("newsletter_subscribers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
          <p className="text-muted-foreground text-sm">{count ?? 0} suscriptor(es) en total.</p>
        </div>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin/newsletter/export" />}>
          <Download />
          Exportar CSV
        </Button>
      </div>

      {(subscribers ?? []).length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail />
            </EmptyMedia>
            <EmptyTitle>Todavía no hay suscriptores</EmptyTitle>
            <EmptyDescription>Aparecen acá cuando alguien se suscribe desde la landing.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(subscribers ?? []).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{segmentLabel[s.segment]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatInTimeZone(s.created_at, AR_TZ, "d MMM yyyy, HH:mm", { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
