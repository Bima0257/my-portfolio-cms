"use client";

import Icon from "@/components/Icon";

interface Props {
  value: string;
  onChange: (name: string) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[0.85rem] font-semibold text-on-surface">Icon</label>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-muted rounded-[10px] flex items-center justify-center flex-shrink-0">
          <Icon name={value} size={22} className="text-primary" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ketik nama icon..."
          className="flex-1 bg-surface border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface outline-none focus:border-primary"
        />
      </div>
      <p className="text-[0.7rem] text-on-surface-muted">
        Cari icon di{" "}
        <a
          href="https://icon-sets.iconify.design"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          icon-sets.iconify.design
        </a>
        {" — "}cukup ketik nama (palette, react) atau format (simple-icons:codeigniter, mdi:palette)
      </p>
    </div>
  );
}
