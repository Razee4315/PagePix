import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { XCircle, WarningCircle, ArrowCounterClockwise, House, Play, FileText } from "@phosphor-icons/react";
import { ProgressBar } from "../components/ProgressBar";
import { PageThumbnailGrid } from "../components/PageThumbnailGrid";
import { ImageLightbox } from "../components/ImageLightbox";
import type {
  AppSettings,
  ConversionProgress,
  ConversionResult,
} from "../types";

interface ProcessingViewProps {
  pdfPath: string;
  pdfFilename: string;
  settings: AppSettings;
  progress: ConversionProgress[];
  totalPages: number;
  pageRange: string;
  onPageRangeChange: (range: string) => void;
  onProgress: (data: ConversionProgress) => void;
  onComplete: (data: ConversionResult) => void;
  onCancel: () => void;
}

export function ProcessingView({
  pdfPath,
  pdfFilename,
  settings,
  progress,
  totalPages,
  pageRange,
  onPageRangeChange,
  onProgress,
  onComplete,
  onCancel,
}: ProcessingViewProps) {
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [phase, setPhase] = useState<"ready" | "converting">("ready");

  // Start conversion
  const startConversion = useCallback(async () => {
    setPhase("converting");
    startedRef.current = true;

    let unlistenProgress: (() => void) | null = null;
    let unlistenComplete: (() => void) | null = null;
    let unlistenError: (() => void) | null = null;

    unlistenProgress = await listen<ConversionProgress>(
      "conversion-progress",
      (event) => { onProgress(event.payload); },
    );

    unlistenComplete = await listen<ConversionResult>(
      "conversion-complete",
      (event) => {
        onComplete(event.payload);
        unlistenProgress?.();
        unlistenComplete?.();
        unlistenError?.();
      },
    );

    unlistenError = await listen<{ message: string }>(
      "conversion-error",
      (event) => {
        setError(event.payload.message);
        unlistenProgress?.();
        unlistenComplete?.();
        unlistenError?.();
      },
    );

    try {
      await invoke("convert_pdf", {
        path: pdfPath,
        format: settings.format,
        quality: settings.format === "jpeg" ? settings.jpegQuality : settings.webpQuality,
        outputDir: settings.outputDirectory || "",
        namingPattern: settings.namingPattern,
        pageRange: pageRange,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      unlistenProgress?.();
      unlistenComplete?.();
      unlistenError?.();
    }
  }, [pdfPath, settings, pageRange, onProgress, onComplete]);

  const handleCancel = async () => {
    try {
      await invoke("cancel_conversion");
    } catch {
      // ignore
    }
    onCancel();
  };

  const handleRetry = () => {
    setError(null);
    startedRef.current = false;
    setPhase("ready");
  };

  const handleThumbnailClick = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleLightboxClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handleLightboxNavigate = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const currentPage = progress.length;

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 py-6 gap-5">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <WarningCircle size={48} weight="duotone" className="text-danger" />
        </motion.div>

        <div className="text-center space-y-1.5 max-w-xs">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Conversion Failed
          </h2>
          <p data-selectable className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {error}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
            Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition-colors"
          >
            <House size={16} weight="bold" />
            Go Home
          </motion.button>
        </div>
      </div>
    );
  }

  // Ready state — show page range input before starting
  if (phase === "ready") {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 py-6 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 22 }}
          className="w-full max-w-sm space-y-6"
        >
          {/* File info */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900">
            <FileText size={24} weight="duotone" className="text-accent shrink-0" />
            <div className="min-w-0">
              <p data-selectable className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {pdfFilename}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 uppercase">
                {settings.format}
              </p>
            </div>
          </div>

          {/* Page range */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Page Range
            </label>
            <input
              type="text"
              value={pageRange}
              onChange={(e) => onPageRangeChange(e.target.value)}
              placeholder="All pages (e.g. 1-5, 8, 10-12)"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm font-mono text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 outline-none transition-all focus:ring-2 focus:ring-accent/40"
            />
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 px-1">
              Leave empty to convert all pages. Use commas and dashes for ranges.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startConversion}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Play size={16} weight="bold" />
              Start Converting
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              className="px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition-colors"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Converting state
  return (
    <>
      <div className="h-full flex flex-col px-6 py-6 gap-6 overflow-auto">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Converting
          </h2>
          <p data-selectable className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono truncate">
            {pdfFilename}
            {pageRange && (
              <span className="text-zinc-400 dark:text-zinc-600"> — pages {pageRange}</span>
            )}
          </p>
        </div>

        <ProgressBar current={currentPage} total={totalPages || currentPage} />

        <div className="flex-1 overflow-auto">
          <PageThumbnailGrid
            thumbnails={progress}
            totalPages={totalPages || currentPage}
            onThumbnailClick={handleThumbnailClick}
          />
        </div>

        <div className="flex justify-center pt-2 pb-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition-colors"
            title="Cancel conversion"
          >
            <XCircle size={16} weight="bold" />
            Cancel
          </motion.button>
        </div>
      </div>

      {lightboxIndex !== null && progress[lightboxIndex] && (
        <ImageLightbox
          thumbnails={progress}
          currentIndex={lightboxIndex}
          onClose={handleLightboxClose}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </>
  );
}
