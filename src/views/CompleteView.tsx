import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { CheckCircle, FolderOpen, ArrowCounterClockwise, Copy, Check } from "@phosphor-icons/react";
import { PageThumbnailGrid } from "../components/PageThumbnailGrid";
import { ImageLightbox } from "../components/ImageLightbox";
import type { ConversionResult, ConversionProgress } from "../types";

interface CompleteViewProps {
  result: ConversionResult;
  thumbnails: ConversionProgress[];
  autoOpenFolder: boolean;
  onConvertAnother: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CompleteView({
  result,
  thumbnails,
  autoOpenFolder,
  onConvertAnother,
}: CompleteViewProps) {
  const [copied, setCopied] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const autoOpenedRef = useRef(false);

  // Auto-open the output folder when conversion completes
  useEffect(() => {
    if (autoOpenFolder && !autoOpenedRef.current) {
      autoOpenedRef.current = true;
      invoke("open_output_folder", { path: result.outputDir }).catch(console.error);
    }
  }, [autoOpenFolder, result.outputDir]);

  const handleOpenFolder = async () => {
    try {
      await invoke("open_output_folder", { path: result.outputDir });
    } catch (err) {
      console.error("Failed to open folder:", err);
    }
  };

  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText(result.outputDir).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(console.error);
  }, [result.outputDir]);

  const handleThumbnailClick = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handleLightboxNavigate = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  return (
    <>
      <div className="h-full flex flex-col px-6 py-6 gap-6 overflow-auto">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex items-center gap-3"
        >
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.1 }}
          >
            <CheckCircle size={36} weight="fill" className="text-success" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Done
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {result.pageCount} page{result.pageCount !== 1 ? "s" : ""} saved as{" "}
              <span className="font-medium text-zinc-700 dark:text-zinc-300 uppercase">
                {result.format}
              </span>
              <span className="mx-1.5 text-zinc-300 dark:text-zinc-700">|</span>
              <span className="font-mono">{formatFileSize(result.totalSize)}</span>
            </p>
          </div>
        </motion.div>

        {/* Output Path */}
        <div className="flex items-center gap-2">
          <div
            data-selectable
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate"
          >
            {result.outputDir}
          </div>
          <button
            onClick={handleCopyPath}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Copy path"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check size={14} weight="bold" className="text-success" />
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Copy size={14} weight="bold" className="text-zinc-500 dark:text-zinc-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Thumbnail Grid */}
        <div className="flex-1 overflow-auto">
          <PageThumbnailGrid
            thumbnails={thumbnails}
            totalPages={result.pageCount}
            onThumbnailClick={handleThumbnailClick}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 pb-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenFolder}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            <FolderOpen size={18} weight="bold" />
            Open Folder
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onConvertAnother}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-medium transition-colors"
          >
            <ArrowCounterClockwise size={18} weight="bold" />
            Convert Another
          </motion.button>
        </div>
      </div>

      {/* Image lightbox */}
      {lightboxIndex !== null && thumbnails[lightboxIndex] && (
        <ImageLightbox
          thumbnails={thumbnails}
          currentIndex={lightboxIndex}
          onClose={handleLightboxClose}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </>
  );
}
