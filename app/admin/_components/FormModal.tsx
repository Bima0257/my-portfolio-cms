"use client";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export default function FormModal({ open, title, onClose, onSubmit, loading, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto bg-black/30 backdrop-blur-sm">
      <div className="bg-surface-card rounded-[20px] p-8 max-w-[560px] w-full mx-4 mb-[5vh] border border-outline-variant shadow-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-[1.2rem] font-bold text-on-surface">{title}</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-surface-low text-on-surface-muted border-none cursor-pointer hover:bg-outline-variant transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {children}

          <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-semibold bg-surface-low text-on-surface border-none cursor-pointer hover:bg-outline-variant transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-[10px] text-[0.85rem] font-semibold bg-primary text-white border-none cursor-pointer hover:bg-primary-accent transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
