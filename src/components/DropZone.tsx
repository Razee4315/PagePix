import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { FilePdf, UploadSimple, Warning } from "@phosphor-icons/react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

interface DropZoneProps {
  onFileSelected: (filePath: string) => void;
  onBrowse: () => void;
}

export function DropZone({ onFileSelected, onBrowse }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse-tracking for subtle tilt effect
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useTransform(mouseY, [0, 1], [2, -2]);
  const rotateY = useTransform(mouseX, [0, 1], [-2, 2]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

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
          setIsDragging(false);
        }
      });
    }

    setupDragDrop();
    return () => { unlisten?.(); };
  }, [onFileSelected]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onBrowse}
        style={{ rotateX, rotateY, perspective: 800 }}
        className="relative w-full cursor-pointer group"
      >
        {/* Outer glow on drag */}
        <motion.div
          animate={{
            opacity: isDragging ? 1 : 0,
            scale: isDragging ? 1 : 0.95,
          }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute -inset-2 rounded-3xl bg-accent/10 blur-xl pointer-events-none"
        />

        {/* Main card */}
        <motion.div
          animate={{
            borderColor: isDragging ? "var(--color-accent)" : undefined,
          }}
          transition={{ duration: 0.2 }}
          className="relative rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 overflow-hidden"
        >
          {/* Shimmer on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-accent/[0.03] via-transparent to-accent/[0.03] pointer-events-none" />

          <div className="flex flex-col items-center justify-center gap-5 py-14 px-8">
            <motion.div
              animate={
                isDragging
                  ? { scale: 1.2, y: -8 }
                  : { scale: 1, y: 0 }
              }
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <div className="relative">
                {isDragging ? (
                  <UploadSimple size={44} weight="duotone" className="text-accent" />
                ) : (
                  <FilePdf
                    size={44}
                    weight="duotone"
                    className="text-zinc-400 dark:text-zinc-500 group-hover:text-accent transition-colors duration-300"
                  />
                )}
                {/* Pulse ring */}
                <motion.div
                  animate={isDragging ? { scale: [1, 1.6], opacity: [0.4, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-accent pointer-events-none"
                  style={{ display: isDragging ? "block" : "none" }}
                />
              </div>
            </motion.div>

            <div className="text-center space-y-1.5">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {isDragging ? "Release to convert" : "Drop your PDF here"}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                or click to browse
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
