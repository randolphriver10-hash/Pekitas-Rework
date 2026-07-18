"use client";

import type { ReactNode, ElementType } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type DragProps = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
  isDragging: boolean;
};

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  strategy,
  children,
}: {
  items: T[];
  onReorder: (newItems: T[]) => void;
  strategy: SortingStrategy;
  children: (item: T, index: number) => ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={strategy}>
        {items.map((item, index) => children(item, index))}
      </SortableContext>
    </DndContext>
  );
}

export function SortableItem({
  id,
  as,
  className,
  children,
}: {
  id: string;
  as?: ElementType;
  className?: string;
  children: (drag: DragProps) => ReactNode;
}) {
  const Comp = (as ?? "div") as ElementType;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <Comp
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && "z-10 opacity-60", className)}
    >
      {children({ attributes, listeners, isDragging })}
    </Comp>
  );
}

export function DragHandle({
  attributes,
  listeners,
  className,
}: Pick<DragProps, "attributes" | "listeners"> & { className?: string }) {
  return (
    <button
      type="button"
      aria-label="Arrastrar para reordenar"
      className={cn(
        "text-muted-foreground hover:text-foreground cursor-grab touch-none active:cursor-grabbing",
        className
      )}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}
