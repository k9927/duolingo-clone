"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { CloseIcon } from "../icons";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  /** "sheet" slides up from the bottom on mobile, like Duolingo's lesson modals. */
  variant?: "dialog" | "sheet";
  showClose?: boolean;
  labelledBy?: string;
  /** Max width on larger screens (defaults per variant). */
  width?: string;
}

export function Modal({ open, onClose, children, variant = "dialog", showClose = false, labelledBy, width }: ModalProps) {
  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const sheet = variant === "sheet";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`fixed inset-0 z-50 flex justify-center bg-black/50 ${sheet ? "items-end sm:items-center" : "items-center p-4"}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={`relative w-full bg-bg p-6 text-ink shadow-xl ${
              sheet ? `${width ?? "max-w-lg"} rounded-t-3xl pb-8 sm:rounded-2xl` : `${width ?? "max-w-md"} rounded-3xl`
            }`}
            initial={sheet ? { y: "100%" } : { scale: 0.85, opacity: 0 }}
            animate={sheet ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={sheet ? { y: "100%" } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {showClose && onClose && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-lg p-1 text-faint hover:bg-surface-2"
                aria-label="Close"
              >
                <CloseIcon size={22} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
