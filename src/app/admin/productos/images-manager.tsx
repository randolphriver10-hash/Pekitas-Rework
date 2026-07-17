"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/image-uploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import {
  addProductImageAction,
  removeProductImageAction,
  setPrimaryImageAction,
} from "@/app/admin/productos/actions";
import type { ProductImageRow } from "@/lib/supabase/types";

export function ImagesManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImageRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState("");

  const handleUploaded = (url: string) => {
    setPendingUrl(url);
  };

  const confirmAdd = () => {
    if (!pendingUrl) return;
    if (!altText.trim()) {
      toast.error("El texto alternativo es obligatorio.");
      return;
    }
    startTransition(async () => {
      const result = await addProductImageAction(productId, { url: pendingUrl, alt_text: altText });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      setPendingUrl(null);
      setAltText("");
      toast.success("Imagen agregada.");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Imágenes</CardTitle>
        <CardDescription>La primera marcada con estrella es la imagen principal.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                <Image src={img.url} alt={img.alt_text} fill sizes="150px" className="object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    variant={img.is_primary ? "default" : "ghost"}
                    size="icon-xs"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        await setPrimaryImageAction(img.id, productId);
                      })
                    }
                  >
                    <Star className={img.is_primary ? "fill-current" : ""} />
                  </Button>
                  <ConfirmDialog
                    trigger={
                      <Button type="button" variant="ghost" size="icon-xs">
                        <Trash2 />
                      </Button>
                    }
                    title="¿Eliminar imagen?"
                    description="Se borra también del almacenamiento."
                    confirmLabel="Eliminar"
                    onConfirm={() => removeProductImageAction(img.id, productId)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingUrl ? (
          <div className="space-y-2 rounded-lg border p-3">
            <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded">
              <Image src={pendingUrl} alt="" fill className="object-cover" />
            </div>
            <Input
              placeholder="Texto alternativo (obligatorio)"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" disabled={isPending} onClick={confirmAdd}>
                Confirmar
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setPendingUrl(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <ImageUploader
            bucket="product-images"
            folder={productId}
            onUploaded={handleUploaded}
            label="Elegir imagen"
          />
        )}
      </CardContent>
    </Card>
  );
}
