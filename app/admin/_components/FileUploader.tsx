"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  currentUrl: string | null;
  file: File | null;
  setFile: (f: File | null) => void;
  onRemove?: () => void;
  accept?: string;
  label?: string;
  previewHeight?: string;
  type?: "image" | "file";
}

export default function FileUploader({
  currentUrl,
  file,
  setFile,
  onRemove,
  accept = "image/*",
  label = "File",
  previewHeight = "180px",
  type = "image",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Build preview URL from current data or new file
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(currentUrl);
    }
  }, [file, currentUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(currentUrl);
    onRemove?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  const isPdf = file?.type === "application/pdf" || (!file && currentUrl?.endsWith(".pdf"));
  const fileName = file?.name ?? (currentUrl ? currentUrl.split("/").pop() : null);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[0.85rem] font-semibold text-on-surface">{label}</label>

      {/* Upload area */}
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed border-outline-variant rounded-[12px] overflow-hidden cursor-pointer hover:border-primary transition-colors group ${
          type === "image" ? "" : "py-6"
        }`}
        style={type === "image" ? { minHeight: previewHeight } : {}}
      >
        {type === "image" && preview ? (
          <div className="relative w-full h-full min-h-[inherit] flex items-center justify-center bg-surface-low">
            {isPdf ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <span className="material-symbols-outlined text-outline" style={{ fontSize: 48 }}>picture_as_pdf</span>
                <span className="text-[0.8rem] text-on-surface-muted">{fileName}</span>
              </div>
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain max-h-[250px]"
                style={{ maxHeight: previewHeight }}
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 text-white text-[0.85rem] font-semibold bg-black/50 px-4 py-2 rounded-full transition-opacity">
                Click to change
              </span>
            </div>
          </div>
        ) : type === "file" && fileName ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: 48 }}>
              {isPdf ? "picture_as_pdf" : "description"}
            </span>
            <span className="text-[0.85rem] text-on-surface-muted">{fileName}</span>
            <span className="text-[0.75rem] text-on-surface-muted/60">Click to change file</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8">
            <span className="material-symbols-outlined text-outline-variant" style={{ fontSize: 40 }}>upload</span>
            <span className="text-[0.85rem] text-on-surface-muted">
              {type === "image" ? "Click to upload image" : "Click to upload file"}
            </span>
            <span className="text-[0.75rem] text-on-surface-muted/60">
              {accept.includes("pdf") ? "PDF" : accept.includes("image") ? "PNG, JPG, WebP" : "All files"} — max 5MB
            </span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-1.5 rounded-[8px] text-[0.78rem] font-semibold bg-surface-low text-on-surface-muted border border-outline-variant cursor-pointer hover:bg-outline-variant transition-colors"
        >
          Choose File
        </button>
        {(file || currentUrl) && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-1.5 rounded-[8px] text-[0.78rem] font-semibold bg-red-50 text-red-500 border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
