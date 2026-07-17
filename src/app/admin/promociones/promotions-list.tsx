"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { PromotionDialog } from "@/app/admin/promociones/promotion-dialog";
import { toggleStatusAction, softDeletePromotionAction } from "@/app/admin/promociones/actions";
import { toArDatetimeLocal, AR_TZ } from "@/lib/timezone";
import type { CategoryRow, PromotionRow } from "@/lib/supabase/types";

type PromotionWithProducts = PromotionRow & { productIds: string[] };

export function PromotionsList({
  promotions,
  categories,
  products,
}: {
  promotions: PromotionWithProducts[];
  categories: CategoryRow[];
  products: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [now] = useState(() => Date.now());

  const vigencia = (p: PromotionRow) => {
    const start = new Date(p.start_at).getTime();
    const end = new Date(p.end_at).getTime();
    if (p.status !== "published") return null;
    if (now < start) return "programada";
    if (now > end) return "vencida";
    return "vigente";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PromotionDialog
          categories={categories}
          products={products}
          trigger={
            <Button>
              <Plus /> Nueva promoción
            </Button>
          }
        />
      </div>

      {promotions.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Tag />
            </EmptyMedia>
            <EmptyTitle>Sin promociones</EmptyTitle>
            <EmptyDescription>Creá la primera oferta.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Vigencia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promo) => {
                const v = vigencia(promo);
                return (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">{promo.name}</TableCell>
                    <TableCell>
                      {promo.discount_type === "percentage"
                        ? `${promo.discount_percentage}%`
                        : `$${promo.fixed_price}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatInTimeZone(promo.start_at, AR_TZ, "d MMM HH:mm", { locale: es })} —{" "}
                      {formatInTimeZone(promo.end_at, AR_TZ, "d MMM HH:mm", { locale: es })}
                      {v && (
                        <Badge
                          className="ml-2"
                          variant={v === "vigente" ? "default" : v === "vencida" ? "outline" : "secondary"}
                        >
                          {v}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.status === "published" ? "default" : "secondary"}>
                        {promo.status === "published" ? "Publicada" : promo.status === "draft" ? "Borrador" : "Archivada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const result = await toggleStatusAction(
                                promo.id,
                                promo.status === "published" ? "draft" : "published"
                              );
                              if (result?.error) toast.error(result.error);
                            })
                          }
                        >
                          {promo.status === "published" ? "Pasar a borrador" : "Publicar"}
                        </Button>
                        <PromotionDialog
                          categories={categories}
                          products={products}
                          defaultValues={{
                            id: promo.id,
                            name: promo.name,
                            description: promo.description ?? "",
                            discount_type: promo.discount_type,
                            discount_percentage: promo.discount_percentage ?? undefined,
                            fixed_price: promo.fixed_price ?? undefined,
                            category_id: promo.category_id ?? "",
                            productIds: promo.productIds,
                            start_at: toArDatetimeLocal(promo.start_at),
                            end_at: toArDatetimeLocal(promo.end_at),
                            show_countdown: promo.show_countdown,
                            banner_enabled: promo.banner_enabled,
                            status: promo.status,
                          }}
                          trigger={
                            <Button variant="outline" size="icon-sm">
                              <Pencil />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          trigger={
                            <Button variant="outline" size="icon-sm">
                              <Trash2 />
                            </Button>
                          }
                          title={`¿Eliminar ${promo.name}?`}
                          description="Se mueve a la papelera."
                          confirmLabel="Eliminar"
                          onConfirm={() => softDeletePromotionAction(promo.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
