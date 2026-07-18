"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { rectSortingStrategy } from "@dnd-kit/sortable";
import { Images, Pencil, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SortableList, SortableItem, DragHandle } from "@/components/admin/sortable-list";
import { reorderItemsAction } from "@/lib/actions/reorder";
import { GalleryDialog } from "@/app/admin/galeria/gallery-dialog";
import { toggleGalleryItemActiveAction, softDeleteGalleryItemAction } from "@/app/admin/galeria/actions";
import type { GalleryItemRow } from "@/lib/supabase/types";

export function GalleryGrid({ items: initialItems }: { items: GalleryItemRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);

  const handleReorder = (newItems: GalleryItemRow[]) => {
    setItems(newItems);
    startTransition(async () => {
      const result = await reorderItemsAction("gallery_items", newItems.map((i) => i.id), "/admin/galeria");
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <GalleryDialog trigger={<Button><Plus /> Agregar imagen</Button>} />
      </div>

      {items.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Images />
            </EmptyMedia>
            <EmptyTitle>Galería vacía</EmptyTitle>
            <EmptyDescription>Subí la primera imagen.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <SortableList items={items} onReorder={handleReorder} strategy={rectSortingStrategy}>
            {(item) => (
              <SortableItem key={item.id} id={item.id} className="space-y-2 rounded-lg border p-2">
                {({ attributes, listeners }) => (
                  <>
                    <div className="relative aspect-square overflow-hidden rounded">
                      <Image src={item.image_url} alt={item.alt_text} fill sizes="200px" className="object-cover" />
                      <DragHandle
                        attributes={attributes}
                        listeners={listeners}
                        className="bg-background/80 absolute top-1.5 left-1.5 rounded p-1"
                      />
                    </div>
                    {item.title && <p className="truncate text-sm font-medium">{item.title}</p>}
                    <div className="flex items-center justify-between">
                      <Switch
                        checked={item.is_active}
                        disabled={isPending}
                        onCheckedChange={(checked) =>
                          startTransition(async () => {
                            const result = await toggleGalleryItemActiveAction(item.id, checked);
                            if (result?.error) toast.error(result.error);
                          })
                        }
                      />
                      <div className="flex gap-1">
                        <GalleryDialog
                          updatedAt={item.updated_at}
                          defaultValues={{
                            id: item.id,
                            image_url: item.image_url,
                            alt_text: item.alt_text,
                            title: item.title ?? "",
                            description: item.description ?? "",
                            is_active: item.is_active,
                          }}
                          trigger={
                            <Button variant="outline" size="icon-xs">
                              <Pencil />
                            </Button>
                          }
                        />
                        <ConfirmDialog
                          trigger={
                            <Button variant="outline" size="icon-xs">
                              <Trash2 />
                            </Button>
                          }
                          title="¿Eliminar esta imagen?"
                          description="Se borra también del almacenamiento."
                          confirmLabel="Eliminar"
                          onConfirm={() => softDeleteGalleryItemAction(item.id)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </SortableItem>
            )}
          </SortableList>
        </div>
      )}
    </div>
  );
}
