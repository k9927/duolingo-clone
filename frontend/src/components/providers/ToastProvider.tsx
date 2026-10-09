"use client";

import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastTone = "default" | "success" | "error";

interface Toast {
  id: number;
  title: string;
  body?: string;
  icon?: React.ReactNode;
  tone: ToastTone;
}

type ShowToast = (toast: Omit<Toast, "id" | "tone"> & { tone?: ToastTone; durationMs?: number }) => void;

const ToastContext = createContext<ShowToast | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  default: "border-line",
  success: "border-feather",
  error: "border-cardinal",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const show = useCallback<ShowToast>(({ durationMs = 3500, tone = "default", ...toast }) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { ...toast, tone, id }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), durationMs);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-b-4 bg-bg px-4 py-3 shadow-lg ${TONE_STYLES[t.tone]}`}
              role="status"
            >
              {t.icon && <div className="shrink-0 text-3xl leading-none">{t.icon}</div>}
              <div className="min-w-0">
                <p className="font-extrabold text-ink">{t.title}</p>
                {t.body && <p className="text-sm font-semibold text-muted">{t.body}</p>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
