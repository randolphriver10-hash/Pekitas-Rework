"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { History } from "lucide-react";
import { AR_TZ } from "@/lib/timezone";
import type { AuditLogRow } from "@/lib/supabase/types";

type AuditLogWithActor = AuditLogRow & { actorName: string };

const actionLabel: Record<string, string> = { INSERT: "Creó", UPDATE: "Actualizó", DELETE: "Eliminó" };
const actionVariant: Record<string, "default" | "secondary" | "destructive"> = {
  INSERT: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
};

export function AuditLogTable({ logs }: { logs: AuditLogWithActor[] }) {
  const [selected, setSelected] = useState<AuditLogWithActor | null>(null);

  if (logs.length === 0) {
    return (
      <Empty className="mt-4 border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <History />
          </EmptyMedia>
          <EmptyTitle>Sin actividad todavía</EmptyTitle>
          <EmptyDescription>Los cambios en el panel van a aparecer acá.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <>
      <div className="mt-4 overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Tabla</TableHead>
              <TableHead className="text-right">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatInTimeZone(log.created_at, AR_TZ, "d MMM yyyy, HH:mm:ss", { locale: es })}
                </TableCell>
                <TableCell className="text-sm font-medium">{log.actorName}</TableCell>
                <TableCell>
                  <Badge variant={actionVariant[log.action]}>{actionLabel[log.action] ?? log.action}</Badge>
                </TableCell>
                <TableCell className="text-sm">{log.table_name}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="icon-sm" onClick={() => setSelected(log)}>
                    <Eye />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected && (actionLabel[selected.action] ?? selected.action)} en {selected?.table_name}
            </DialogTitle>
            <DialogDescription>
              {selected && `${selected.actorName} — ${formatInTimeZone(selected.created_at, AR_TZ, "d MMM yyyy, HH:mm:ss", { locale: es })}`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {selected?.old_data && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Antes</p>
                <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">
                  {JSON.stringify(selected.old_data, null, 2)}
                </pre>
              </div>
            )}
            {selected?.new_data && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium uppercase">Después</p>
                <pre className="bg-muted overflow-x-auto rounded-lg p-3 text-xs">
                  {JSON.stringify(selected.new_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
