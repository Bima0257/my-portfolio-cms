"use client";

interface Props {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-surface-card rounded-[16px] p-6 max-w-[400px] w-full mx-4 border border-outline-variant shadow-card">
        <h3 className="font-display text-[1.1rem] font-bold text-on-surface mb-2">{title}</h3>
        <p className="text-[0.9rem] text-on-surface-muted mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold bg-surface-low text-on-surface border-none cursor-pointer hover:bg-outline-variant transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold bg-red-500 text-white border-none cursor-pointer hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
