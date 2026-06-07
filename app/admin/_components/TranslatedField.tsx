"use client";

import { useState } from "react";

interface Props {
  label: string;
  enValue: string;
  idValue: string;
  onEnChange: (v: string) => void;
  onIdChange: (v: string) => void;
  required?: boolean;
  type?: "text" | "textarea";
  placeholder?: string;
  rows?: number;
}

export default function TranslatedField({
  label,
  enValue,
  idValue,
  onEnChange,
  onIdChange,
  required,
  type = "text",
  placeholder,
  rows = 3,
}: Props) {
  const [tab, setTab] = useState<"en" | "id">("en");

  const inputClass =
    "w-full bg-surface-low border border-outline-variant rounded-[10px] px-4 py-2.5 text-[0.9rem] text-on-surface placeholder:text-outline outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,106,99,0.08)]";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[0.85rem] font-semibold text-on-surface">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex bg-surface-low border border-outline-variant rounded-[8px] overflow-hidden">
          <button
            type="button"
            onClick={() => setTab("en")}
            className={`px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors ${
              tab === "en"
                ? "bg-primary text-white"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setTab("id")}
            className={`px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider transition-colors ${
              tab === "id"
                ? "bg-primary text-white"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            ID
          </button>
        </div>
      </div>

      {tab === "en" ? (
        type === "textarea" ? (
          <textarea
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            placeholder={placeholder || `English ${label.toLowerCase()}`}
            required={required}
            rows={rows}
            className={inputClass + " resize-none"}
          />
        ) : (
          <input
            type="text"
            value={enValue}
            onChange={(e) => onEnChange(e.target.value)}
            placeholder={placeholder || `English ${label.toLowerCase()}`}
            required={required}
            className={inputClass}
          />
        )
      ) : type === "textarea" ? (
        <textarea
          value={idValue}
          onChange={(e) => onIdChange(e.target.value)}
          placeholder={placeholder || `Indonesian ${label.toLowerCase()}`}
          required={required}
          rows={rows}
          className={inputClass + " resize-none"}
        />
      ) : (
        <input
          type="text"
          value={idValue}
          onChange={(e) => onIdChange(e.target.value)}
          placeholder={placeholder || `Indonesian ${label.toLowerCase()}`}
          required={required}
          className={inputClass}
        />
      )}
    </div>
  );
}
