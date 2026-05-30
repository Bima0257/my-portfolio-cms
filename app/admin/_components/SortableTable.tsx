"use client";

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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  idKey?: string;
  onReorder: (ids: (string | number)[]) => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  loading?: boolean;
}

function SortableRow<T extends Record<string, any>>({
  row,
  columns,
  idValue,
  onEdit,
  onDelete,
}: {
  row: T;
  columns: Column<T>[];
  idValue: string;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: idValue });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr ref={setNodeRef} style={style} className={`border-b border-outline-variant last:border-b-0 ${isDragging ? "bg-primary-muted/50" : "hover:bg-surface-low"}`}>
      <td className="py-3 px-2 w-10 text-center">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing bg-transparent border-none text-on-surface-muted hover:text-primary transition-colors"
          aria-label="Drag to reorder"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>drag_indicator</span>
        </button>
      </td>
      {columns.map((col) => (
        <td key={col.key} className={`py-3 px-3 text-[0.875rem] text-on-surface ${col.className ?? ""}`}>
          {col.render ? col.render(row) : (row[col.key] ?? "-")}
        </td>
      ))}
      <td className="py-3 px-3 text-right whitespace-nowrap">
        <button
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[0.78rem] font-semibold bg-primary-muted text-primary border-none cursor-pointer hover:bg-primary-light transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
          Edit
        </button>
        <button
          onClick={() => onDelete(row)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[0.78rem] font-semibold bg-red-50 text-red-500 border-none cursor-pointer hover:bg-red-100 transition-colors ml-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
        </button>
      </td>
    </tr>
  );
}

export default function SortableTable<T extends Record<string, any>>({
  columns,
  data,
  idKey = "id",
  onReorder,
  onEdit,
  onDelete,
  loading,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const ids = data.map((row) => String(row[idKey]));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...ids];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, active.id as string);
    onReorder(reordered);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-surface-card rounded-[16px] border border-outline-variant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-low">
              <th className="py-3 px-2 w-10" />
              {columns.map((col) => (
                <th key={col.key} className={`py-3 px-3 text-left text-[0.78rem] font-semibold text-on-surface-muted uppercase tracking-wider ${col.className ?? ""}`}>
                  {col.label}
                </th>
              ))}
              <th className="py-3 px-3 text-right text-[0.78rem] font-semibold text-on-surface-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <tbody>
                {data.map((row) => (
                  <SortableRow
                    key={row[idKey]}
                    row={row}
                    columns={columns}
                    idValue={String(row[idKey])}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>
    </div>
  );
}
