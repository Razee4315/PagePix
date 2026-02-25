import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { ConversionProgress } from "../types";

interface ImageLightboxProps {
  thumbnails: ConversionProgress[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageLightbox({
  thumbnails,
  currentIndex,
  onClose,
  onNavigate,
}: ImageLightboxProps) {
  const current = thumbnails[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < thumbnails.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev) onNavigate(currentIndex - 1);
  }, [hasPrev, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 1);
  }, [hasNext, currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  if (!current) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col"
        onClick={onClose}
      >
        {/* Backdrop — full black */}
        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md" />

        {/* Top bar */}
        <div
          className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Page indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white tabular-nums">
              Page {current.currentPage}
            </span>
            <span className="text-xs text-white/40">
              of {thumbnails.length}
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Close (Esc)"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Image area — fills remaining space */}
        <div
          className="relative z-10 flex-1 flex items-center justify-center px-14 pb-4 min-h-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Prev button */}
          <button
            onClick={handlePrev}
            disabled={!hasPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-0 disabled:pointer-events-none text-white transition-all"
            title="Previous page"
          >
            <CaretLeft size={22} weight="bold" />
          </button>

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.img
              key={current.currentPage}
              src={`data:image/png;base64,${current.thumbnailBase64}`}
              alt={`Page ${current.currentPage}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl shadow-black/60"
              draggable={false}
            />
          </AnimatePresence>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-white/5 hover:bg-white/15 disabled:opacity-0 disabled:pointer-events-none text-white transition-all"
            title="Next page"
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </div>

        {/* Bottom thumbnail strip */}
        {thumbnails.length > 1 && (
          <div
            className="relative z-10 shrink-0 px-4 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={thumb.currentPage}
                  onClick={() => onNavigate(idx)}
                  className={`shrink-0 w-10 h-14 rounded-md overflow-hidden transition-all ring-2 ${
                    idx === currentIndex
                      ? "ring-accent opacity-100 scale-105"
                      : "ring-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  {thumb.thumbnailBase64 ? (
                    <img
                      src={`data:image/png;base64,${thumb.thumbnailBase64}`}
                      alt={`Page ${thumb.currentPage}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                      <span className="text-[9px] font-mono text-zinc-500">{thumb.currentPage}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
