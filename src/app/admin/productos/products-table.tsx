"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Copy, ImageOff, Pencil, Star, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import {
  bulkUpdateProductsAction,
  duplicateProductAction,
  softDeleteProductAction,
} from "@/app/admin/productos/actions";
import { useRouter } from "next/navigation";

type ProductRowData = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  status: string;
  is_featured: boolean;
  primaryImageUrl: string | null;
  categoryName: string | null;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  published: "default",
  draft: "secondary",
  hidden: "outline",
  agotado: "destructive",
  archived: "outline",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  hidden: "Oculto",
  agotado: "Agotado",
  archived: "Archivado",
};

export function ProductsTable({ products }: { products: ProductRowData[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(products.map((p) => p.id)) : new Set());
  };
  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const runBulk = (patch: Parameters<typeof bulkUpdateProductsAction>[1], message: string) => {
    startTransition(async () => {
      const result = await bulkUpdateProductsAction([...selected], patch);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(message);
      setSelected(new Set());
    });
  };

  if (products.length === 0) {
    return (
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ImageOff />
          </EmptyMedia>
          <EmptyTitle>Sin productos</EmptyTitle>
          <EmptyDescription>Probá con otros filtros o creá el primer producto.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="bg-muted flex flex-wrap items-center gap-2 rounded-lg border p-2 text-sm">
          <span className="px-2 font-medium">{selected.size} seleccionado(s)</span>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => runBulk({ status: "published" }, "Publicados.")}>
            Publicar
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => runBulk({ status: "hidden" }, "Ocultados.")}>
            Ocultar
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => runBulk({ is_featured: true }, "Marcados como destacados.")}>
            Destacar
          </Button>
          <Button size="sm" variant="outline" disabled={isPending} onClick={() => runBulk({ is_featured: false }, "Quitados de destacados.")}>
            Quitar destacado
          </Button>
          <ConfirmDialog
            trigger={
              <Button size="sm" variant="outline" disabled={isPending}>
                Archivar
              </Button>
            }
            title={`¿Archivar ${selected.size} producto(s)?`}
            description="Van a dejar de mostrarse en la landing."
            confirmLabel="Archivar"
            onConfirm={async () => {
              runBulk({ status: "archived" }, "Archivados.");
            }}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === products.length}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
              </TableHead>
              <TableHead></TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(p.id)}
                    onCheckedChange={(checked) => toggleOne(p.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="bg-muted relative h-10 w-10 overflow-hidden rounded">
                    {p.primaryImageUrl ? (
                      <Image src={p.primaryImageUrl} alt="" fill sizes="40px" className="object-cover" />
                    ) : (
                      <ImageOff className="text-muted-foreground m-auto h-4 w-4 translate-y-3" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-medium">
                    {p.is_featured && <Star className="h-3.5 w-3.5 fill-current text-amber-500" />}
                    {p.name}
                  </div>
                  {p.sku && <div className="text-muted-foreground text-xs">SKU: {p.sku}</div>}
                </TableCell>
                <TableCell className="text-muted-foreground">{p.categoryName ?? "—"}</TableCell>
                <TableCell>
                  {p.sale_price ? (
                    <div>
                      <span className="text-muted-foreground line-through">${p.price}</span>{" "}
                      <span className="font-medium">${p.sale_price}</span>
                    </div>
                  ) : (
                    `$${p.price}`
                  )}
                </TableCell>
                <TableCell>
                  <span className={p.stock === 0 ? "text-destructive font-medium" : undefined}>
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[p.status] ?? "outline"}>{statusLabels[p.status]}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      nativeButton={false}
                      render={<Link href={`/admin/productos/${p.id}`} />}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await duplicateProductAction(p.id);
                          if (result?.error) toast.error(result.error);
                          else {
                            toast.success("Producto duplicado.");
                            router.refresh();
                          }
                        })
                      }
                    >
                      <Copy />
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button variant="outline" size="icon-sm">
                          <Trash2 />
                        </Button>
                      }
                      title={`¿Eliminar ${p.name}?`}
                      description="Se mueve a la papelera."
                      confirmLabel="Eliminar"
                      successMessage="Eliminado."
                      onConfirm={() => softDeleteProductAction(p.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
