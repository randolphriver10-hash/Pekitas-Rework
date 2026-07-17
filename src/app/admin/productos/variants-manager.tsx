"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { upsertVariantAction, removeVariantAction } from "@/app/admin/productos/actions";
import type { ProductVariantRow } from "@/lib/supabase/types";

export function VariantsManager({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariantRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newStock, setNewStock] = useState("0");

  const handleAdd = () => {
    if (!newSize && !newColor) {
      toast.error("Ingresá al menos un talle o color.");
      return;
    }
    startTransition(async () => {
      const result = await upsertVariantAction(productId, {
        size: newSize,
        color: newColor,
        stock: Number(newStock) || 0,
        is_active: true,
      });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setNewSize("");
      setNewColor("");
      setNewStock("0");
      toast.success("Variante agregada.");
    });
  };

  const handleStockChange = (variant: ProductVariantRow, stock: number) => {
    startTransition(async () => {
      const result = await upsertVariantAction(productId, {
        id: variant.id,
        size: variant.size ?? "",
        color: variant.color ?? "",
        stock,
        is_active: variant.is_active,
      });
      if (result?.error) toast.error(result.error);
    });
  };

  const handleActiveToggle = (variant: ProductVariantRow, isActive: boolean) => {
    startTransition(async () => {
      const result = await upsertVariantAction(productId, {
        id: variant.id,
        size: variant.size ?? "",
        color: variant.color ?? "",
        stock: variant.stock,
        is_active: isActive,
      });
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Variantes</CardTitle>
        <CardDescription>Combinaciones de talle/color con stock independiente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {variants.length > 0 && (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Talle</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.size || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {v.color?.startsWith("#") && (
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: v.color }}
                          />
                        )}
                        {v.color || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        defaultValue={v.stock}
                        className="w-20"
                        disabled={isPending}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== v.stock) handleStockChange(v, val);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={v.is_active}
                        disabled={isPending}
                        onCheckedChange={(checked) => handleActiveToggle(v, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <ConfirmDialog
                        trigger={
                          <Button variant="outline" size="icon-sm">
                            <Trash2 />
                          </Button>
                        }
                        title="¿Eliminar variante?"
                        description="Esta acción no se puede deshacer."
                        confirmLabel="Eliminar"
                        onConfirm={() => removeVariantAction(v.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs font-medium">Talle</label>
            <Input value={newSize} onChange={(e) => setNewSize(e.target.value)} className="w-24" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Color</label>
            <Input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-28" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Stock</label>
            <Input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              className="w-20"
            />
          </div>
          <Button type="button" size="sm" disabled={isPending} onClick={handleAdd}>
            <Plus /> Agregar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
