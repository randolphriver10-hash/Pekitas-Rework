"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { importProductsCsvAction, type ImportSummary } from "@/app/admin/productos/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ProductsImportExport() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Elegí un archivo CSV.");
      return;
    }
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await importProductsCsvAction(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSummary(result);
      if (result.errors.length === 0) {
        toast.success(`${result.created} creados, ${result.updated} actualizados.`);
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" nativeButton={false} render={<Link href="/admin/productos/export" />}>
        <Download />
        Exportar CSV
      </Button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSummary(null);
        }}
      >
        <DialogTrigger render={<Button variant="outline" />}>
          <Upload />
          Importar CSV
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar productos desde CSV</DialogTitle>
            <DialogDescription>
              Usá el mismo formato que exporta este panel. Si una fila trae un{" "}
              <code className="text-xs">id</code> existente, actualiza ese producto; si no,
              crea uno nuevo.
            </DialogDescription>
          </DialogHeader>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="file:bg-secondary file:text-secondary-foreground block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm"
          />

          {summary && (
            <div className="bg-muted/50 rounded-md border p-3 text-sm">
              <p>
                {summary.created} creados · {summary.updated} actualizados ·{" "}
                {summary.errors.length} con error
              </p>
              {summary.errors.length > 0 && (
                <ul className="text-muted-foreground mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                  {summary.errors.map((e, i) => (
                    <li key={i}>
                      Fila {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleImport} disabled={isPending}>
              {isPending ? "Importando..." : "Importar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
