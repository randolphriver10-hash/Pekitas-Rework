"use client";

import { Fragment, useState, useTransition } from "react";
import { toast } from "sonner";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CornerDownRight, Pencil, Plus, Trash2, FolderTree } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SortableList, SortableItem, DragHandle } from "@/components/admin/sortable-list";
import { reorderItemsAction } from "@/lib/actions/reorder";
import { CategoryDialog } from "@/app/admin/categorias/category-dialog";
import { toggleCategoryActiveAction, softDeleteCategoryAction } from "@/app/admin/categorias/actions";
import type { CategoryRow } from "@/lib/supabase/types";

type CategoryWithCount = CategoryRow & { productCount: number };

export function CategoriesList({ categories: initialCategories }: { categories: CategoryWithCount[] }) {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const parents = categories.filter((c) => !c.parent_id);
  const childrenByParent = new Map<string, CategoryWithCount[]>();
  for (const c of categories) {
    if (c.parent_id) {
      childrenByParent.set(c.parent_id, [...(childrenByParent.get(c.parent_id) ?? []), c]);
    }
  }

  const handleToggle = (id: string, next: boolean) => {
    startTransition(async () => {
      const result = await toggleCategoryActiveAction(id, next);
      if (result?.error) toast.error(result.error);
    });
  };

  const persistReorder = (ids: string[]) => {
    startTransition(async () => {
      const result = await reorderItemsAction("categories", ids, "/admin/categorias");
      if (result?.error) toast.error(result.error);
    });
  };

  // Reordenar solo tiene sentido dentro del mismo nivel (padres entre sí, o
  // hijos de un mismo padre entre sí) — mezclar niveles no tiene una
  // interpretación visual clara en un árbol de dos niveles.
  const reorderSiblings = (siblings: CategoryWithCount[], newSiblings: CategoryWithCount[]) => {
    const siblingIds = new Set(siblings.map((s) => s.id));
    const reordered: CategoryWithCount[] = [];
    let cursor = 0;
    for (const c of categories) {
      if (siblingIds.has(c.id)) {
        reordered.push(newSiblings[cursor]);
        cursor++;
      } else {
        reordered.push(c);
      }
    }
    setCategories(reordered);
    persistReorder(newSiblings.map((s) => s.id));
  };

  // Categorías huérfanas (padre eliminado, no debería pasar pero por las dudas) —
  // no son arrastrables, se listan al final tal cual.
  const orphans = categories.filter((c) => c.parent_id && !parents.find((p) => p.id === c.parent_id));
  const totalRows = parents.length + [...childrenByParent.values()].flat().length + orphans.length;

  const renderCategoryCells = (category: CategoryWithCount, isChild: boolean) => (
    <>
      <TableCell>
        <div className="flex items-center gap-1.5 font-medium">
          {isChild && <CornerDownRight className="text-muted-foreground h-3.5 w-3.5" />}
          {category.name}
        </div>
        <div className="text-muted-foreground text-xs">/{category.slug}</div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{category.productCount}</Badge>
      </TableCell>
      <TableCell>
        <Switch
          checked={category.is_active}
          disabled={isPending}
          onCheckedChange={(checked) => handleToggle(category.id, checked)}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <CategoryDialog
            parentOptions={parents.filter((p) => p.id !== category.id)}
            updatedAt={category.updated_at}
            defaultValues={{
              id: category.id,
              name: category.name,
              slug: category.slug,
              description: category.description ?? "",
              image_url: category.image_url ?? "",
              parent_id: category.parent_id ?? "",
              is_active: category.is_active,
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
            title={`¿Eliminar ${category.name}?`}
            description="Se mueve a la papelera. No se puede eliminar si tiene productos o subcategorías asociadas."
            confirmLabel="Eliminar"
            successMessage="Eliminada."
            onConfirm={() => softDeleteCategoryAction(category.id)}
          />
        </div>
      </TableCell>
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CategoryDialog
          parentOptions={parents}
          trigger={
            <Button>
              <Plus />
              Nueva categoría
            </Button>
          }
        />
      </div>

      {totalRows === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderTree />
            </EmptyMedia>
            <EmptyTitle>Sin categorías</EmptyTitle>
            <EmptyDescription>Creá la primera para poder organizar productos.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Nombre</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Activa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableList
                items={parents}
                onReorder={(newParents) => reorderSiblings(parents, newParents)}
                strategy={verticalListSortingStrategy}
              >
                {(parent) => {
                  const children = childrenByParent.get(parent.id) ?? [];
                  return (
                    <Fragment key={parent.id}>
                      <SortableItem id={parent.id} as={TableRow}>
                        {({ attributes, listeners }) => (
                          <>
                            <TableCell>
                              <DragHandle attributes={attributes} listeners={listeners} />
                            </TableCell>
                            {renderCategoryCells(parent, false)}
                          </>
                        )}
                      </SortableItem>
                      <SortableList
                        items={children}
                        onReorder={(newChildren) => reorderSiblings(children, newChildren)}
                        strategy={verticalListSortingStrategy}
                      >
                        {(child) => (
                          <SortableItem key={child.id} id={child.id} as={TableRow}>
                            {({ attributes, listeners }) => (
                              <>
                                <TableCell>
                                  <DragHandle attributes={attributes} listeners={listeners} />
                                </TableCell>
                                {renderCategoryCells(child, true)}
                              </>
                            )}
                          </SortableItem>
                        )}
                      </SortableList>
                    </Fragment>
                  );
                }}
              </SortableList>
              {orphans.map((category) => (
                <TableRow key={category.id}>
                  <TableCell />
                  {renderCategoryCells(category, false)}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
