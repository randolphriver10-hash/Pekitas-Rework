"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { RotateCcw, Trash2, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { restoreItemAction, hardDeleteItemAction, type TrashTable } from "@/app/admin/historial/actions";
import { AR_TZ } from "@/lib/timezone";

export type TrashItem = {
  table: TrashTable;
  typeLabel: string;
  id: string;
  name: string;
  deletedAt: string;
  deletedByName: string;
};

export function TrashList({ items }: { items: TrashItem[] }) {
  const [isPending, startTransition] = useTransition();

  const handleRestore = (item: TrashItem) => {
    startTransition(async () => {
      const result = await restoreItemAction(item.table, item.id);
      if (result?.error) toast.error(result.error);
      else toast.success("Restaurado.");
    });
  };

  if (items.length === 0) {
    return (
      <Empty className="mt-4 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trash />
          </EmptyMedia>
          <EmptyTitle>La papelera está vacía</EmptyTitle>
          <EmptyDescription>Los elementos eliminados aparecen acá antes de borrarse para siempre.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Eliminado por</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.table}-${item.id}`}>
              <TableCell>
                <Badge variant="secondary">{item.typeLabel}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{item.deletedByName}</TableCell>
              <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                {formatInTimeZone(item.deletedAt, AR_TZ, "d MMM yyyy, HH:mm", { locale: es })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleRestore(item)}
                  >
                    <RotateCcw /> Restaurar
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button variant="outline" size="icon-sm">
                        <Trash2 />
                      </Button>
                    }
                    title={`¿Eliminar "${item.name}" definitivamente?`}
                    description="Esta acción no se puede deshacer. Solo administradores pueden hacer esto."
                    confirmLabel="Eliminar para siempre"
                    successMessage="Eliminado definitivamente."
                    onConfirm={() => hardDeleteItemAction(item.table, item.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
