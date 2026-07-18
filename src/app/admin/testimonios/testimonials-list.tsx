"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Pencil, Plus, Star, Trash2, MessageSquareQuote } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SortableList, SortableItem, DragHandle } from "@/components/admin/sortable-list";
import { reorderItemsAction } from "@/lib/actions/reorder";
import { TestimonialDialog } from "@/app/admin/testimonios/testimonial-dialog";
import { softDeleteTestimonialAction } from "@/app/admin/testimonios/actions";
import type { TestimonialRow } from "@/lib/supabase/types";

export function TestimonialsList({ testimonials: initial }: { testimonials: TestimonialRow[] }) {
  const [, startTransition] = useTransition();
  const [testimonials, setTestimonials] = useState(initial);

  const handleReorder = (newItems: TestimonialRow[]) => {
    setTestimonials(newItems);
    startTransition(async () => {
      const result = await reorderItemsAction(
        "testimonials",
        newItems.map((t) => t.id),
        "/admin/testimonios"
      );
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <TestimonialDialog trigger={<Button><Plus /> Nuevo</Button>} />
      </div>

      {testimonials.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquareQuote />
            </EmptyMedia>
            <EmptyTitle>Sin testimonios</EmptyTitle>
            <EmptyDescription>Agregá el primero.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Cliente</TableHead>
                <TableHead>Testimonio</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableList items={testimonials} onReorder={handleReorder} strategy={verticalListSortingStrategy}>
                {(t) => (
                  <SortableItem key={t.id} id={t.id} as={TableRow}>
                    {({ attributes, listeners }) => (
                      <>
                        <TableCell>
                          <DragHandle attributes={attributes} listeners={listeners} />
                        </TableCell>
                        <TableCell className="font-medium">{t.customer_name}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">{t.content}</TableCell>
                        <TableCell>
                          {t.rating && (
                            <span className="flex items-center gap-1">
                              {t.rating} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={t.status === "published" ? "default" : "secondary"}>
                            {t.status === "published" ? "Publicado" : t.status === "draft" ? "Borrador" : "Archivado"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TestimonialDialog
                              updatedAt={t.updated_at}
                              defaultValues={{
                                id: t.id,
                                customer_name: t.customer_name,
                                content: t.content,
                                rating: t.rating ?? undefined,
                                photo_url: t.photo_url ?? "",
                                status: t.status,
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
                              title={`¿Eliminar el testimonio de ${t.customer_name}?`}
                              description="Se mueve a la papelera."
                              confirmLabel="Eliminar"
                              onConfirm={() => softDeleteTestimonialAction(t.id)}
                            />
                          </div>
                        </TableCell>
                      </>
                    )}
                  </SortableItem>
                )}
              </SortableList>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
