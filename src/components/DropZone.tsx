import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FilePdf, UploadSimple, Warning } from "@phosphor-icons/react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

interface DropZoneProps {
  onFileSelected: (filePath: string) => void;
  onBrowse: () => void;
}

export function DropZone({ onFileSelected, onBrowse }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;

    async function setupDragDrop() {
      unlisten = await getCurrentWebview().onDragDropEvent((event) => {
        if (event.payload.type === "over") {
          setIsDragging(true);
          setError(null);
        } else if (event.payload.type === "drop") {
          setIsDragging(false);
          const paths = event.payload.paths;
          if (paths.length > 0) {
            const filePath = paths[0];
            if (filePath.toLowerCase().endsWith(".pdf")) {
              onFileSelected(filePath);
            } else {
              setError("Only PDF files are supported");
            }
          }
        } else {
          // cancelled
          setIsDragging(false);
        }
      });
    }

    setupDragDrop();
    return () => {
      unlisten?.();
    };
  }, [onFileSelected]);

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{
          borderColor: isDragging ? "#3B82F6" : undefined,
          backgroundColor: isDragging
            ? "rgba(59, 130, 246, 0.04)"
            : "transparent",
        }}
        onClick={onBrowse}
        className="relative w-full max-w-md rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer group"
      >
        <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
          <motion.div
            animate={isDragging ? { scale: 1.15, y: -4 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isDragging ? (
              <UploadSimple
                size={48}
                weight="duotone"
                className="text-accent"
              />
            ) : (
              <FilePdf
                size={48}
                weight="duotone"
                className="text-zinc-400 dark:text-zinc-500 group-hover:text-accent transition-colors"
              />
            )}
          </motion.div>

          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isDragging ? "Release to convert" : "Drop your PDF here"}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              or click to browse files
            </p>
          </div>
        </div>

        {/* Hover glow ring */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ring-1 ring-accent/20" />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-medium"
          >
            <Warning size={14} weight="bold" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
