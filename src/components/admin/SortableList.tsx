"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, type ReactNode } from "react";

type Props<T extends { id: string }> = {
  items: T[];
  onReorder: (ids: string[]) => void | Promise<void>;
  renderRow: (item: T, handle: ReactNode) => ReactNode;
  as?: "tbody" | "ul";
};

export function SortableList<T extends { id: string }>({ items, onReorder, renderRow, as = "ul" }: Props<T>) {
  const [order, setOrder] = useState(items);
  useEffect(() => setOrder(items), [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = order.findIndex((i) => i.id === active.id);
    const to = order.findIndex((i) => i.id === over.id);
    const next = arrayMove(order, from, to);
    setOrder(next);
    void onReorder(next.map((i) => i.id));
  }

  const Wrapper = as;
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={order.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <Wrapper className={as === "ul" ? "flex flex-col gap-2" : undefined}>
          {order.map((item) => (
            <SortableRow key={item.id} id={item.id} as={as === "tbody" ? "tr" : "li"}>
              {(handle) => renderRow(item, handle)}
            </SortableRow>
          ))}
        </Wrapper>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  as,
  children,
}: {
  id: string;
  as: "tr" | "li";
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const handle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      aria-label="Arrastrar para reordenar"
      className="cursor-grab touch-none rounded-[6px] p-1.5 text-muted hover:bg-surface-2 hover:text-ink active:cursor-grabbing"
    >
      <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden="true">
        <circle cx="7" cy="5" r="1.5" />
        <circle cx="13" cy="5" r="1.5" />
        <circle cx="7" cy="10" r="1.5" />
        <circle cx="13" cy="10" r="1.5" />
        <circle cx="7" cy="15" r="1.5" />
        <circle cx="13" cy="15" r="1.5" />
      </svg>
    </button>
  );
  const Tag = as;
  return (
    <Tag ref={setNodeRef} style={style} className={isDragging ? "relative z-10 opacity-80" : undefined}>
      {children(handle)}
    </Tag>
  );
}
