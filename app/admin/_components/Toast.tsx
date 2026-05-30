"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors: Record<ToastType, { bg: string; icon: string; iconBg: string }> = {
    success: { bg: "bg-white", icon: "check_circle", iconBg: "bg-green-100 text-green-600" },
    error: { bg: "bg-white", icon: "error", iconBg: "bg-red-100 text-red-500" },
    info: { bg: "bg-white", icon: "info", iconBg: "bg-blue-100 text-blue-500" },
  };

  const c = colors[toast.type];

  return (
    <div
      className={`${c.bg} border border-outline-variant rounded-[14px] shadow-card pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[320px] max-w-[420px] animate-slide-in`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{c.icon}</span>
      </div>
      <p className="flex-1 text-[0.875rem] text-on-surface leading-snug">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-transparent border-none text-on-surface-muted hover:bg-surface-low cursor-pointer transition-colors"
        aria-label="Close"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
      </button>
    </div>
  );
}
