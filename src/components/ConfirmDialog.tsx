import { useEffect } from "react";
import { motion } from "framer-motion";
import { Warning } from "@phosphor-icons/react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Esc to dismiss
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onCancel, onConfirm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Dialog */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-xs mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl shadow-black/20 ring-1 ring-zinc-200 dark:ring-zinc-800 overflow-hidden"
      >
        <div className="px-5 pt-5 pb-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 shrink-0">
              <Warning size={20} weight="fill" className="text-danger" />
            </div>
            <div className="space-y-1 pt-0.5">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-danger hover:bg-danger-hover text-white transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
