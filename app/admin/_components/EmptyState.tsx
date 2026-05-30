"use client";

interface Props {
  label: string;
  onAdd: () => void;
}

export default function EmptyState({ label, onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-primary-muted rounded-[20px] flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-primary" style={{ fontSize: 32 }}>database</span>
      </div>
      <p className="text-[0.95rem] text-on-surface-muted mb-4">No {label.toLowerCase()} yet.</p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-[0.85rem] font-semibold border-none cursor-pointer hover:bg-primary-accent transition-all"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
        Add {label}
      </button>
    </div>
  );
}
