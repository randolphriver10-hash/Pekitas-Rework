"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { SortableList, SortableItem, DragHandle } from "@/components/admin/sortable-list";
import { reorderItemsAction } from "@/lib/actions/reorder";
import { FaqDialog } from "@/app/admin/faqs/faq-dialog";
import { toggleFaqActiveAction, softDeleteFaqAction } from "@/app/admin/faqs/actions";
import type { FaqRow } from "@/lib/supabase/types";

export function FaqsList({ faqs: initialFaqs }: { faqs: FaqRow[] }) {
  const [isPending, startTransition] = useTransition();
  const [faqs, setFaqs] = useState(initialFaqs);

  const handleReorder = (newFaqs: FaqRow[]) => {
    setFaqs(newFaqs);
    startTransition(async () => {
      const result = await reorderItemsAction("faqs", newFaqs.map((f) => f.id), "/admin/faqs");
      if (result?.error) toast.error(result.error);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <FaqDialog trigger={<Button><Plus /> Nueva pregunta</Button>} />
      </div>

      {faqs.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HelpCircle />
            </EmptyMedia>
            <EmptyTitle>Sin preguntas frecuentes</EmptyTitle>
            <EmptyDescription>Agregá la primera.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Pregunta</TableHead>
                <TableHead>Activa</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableList items={faqs} onReorder={handleReorder} strategy={verticalListSortingStrategy}>
                {(f) => (
                  <SortableItem key={f.id} id={f.id} as={TableRow}>
                    {({ attributes, listeners }) => (
                      <>
                        <TableCell>
                          <DragHandle attributes={attributes} listeners={listeners} />
                        </TableCell>
                        <TableCell className="font-medium">{f.question}</TableCell>
                        <TableCell>
                          <Switch
                            checked={f.is_active}
                            disabled={isPending}
                            onCheckedChange={(checked) =>
                              startTransition(async () => {
                                const result = await toggleFaqActiveAction(f.id, checked);
                                if (result?.error) toast.error(result.error);
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <FaqDialog
                              updatedAt={f.updated_at}
                              defaultValues={{
                                id: f.id,
                                question: f.question,
                                answer: f.answer,
                                category: f.category ?? "",
                                is_active: f.is_active,
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
                              title="¿Eliminar esta pregunta?"
                              description="Se mueve a la papelera."
                              confirmLabel="Eliminar"
                              onConfirm={() => softDeleteFaqAction(f.id)}
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
