"use client";

import { Pencil, Plus, Star, Trash2, MessageSquareQuote } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { TestimonialDialog } from "@/app/admin/testimonios/testimonial-dialog";
import { softDeleteTestimonialAction } from "@/app/admin/testimonios/actions";
import type { TestimonialRow } from "@/lib/supabase/types";

export function TestimonialsList({ testimonials }: { testimonials: TestimonialRow[] }) {
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
                <TableHead>Cliente</TableHead>
                <TableHead>Testimonio</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
