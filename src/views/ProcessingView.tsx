import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { XCircle, WarningCircle, ArrowCounterClockwise, House } from "@phosphor-icons/react";
import { ProgressBar } from "../components/ProgressBar";
import { PageThumbnailGrid } from "../components/PageThumbnailGrid";
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
  onProgress,
  onComplete,
  onCancel,
}: ProcessingViewProps) {
  const startedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let unlistenProgress: (() => void) | null = null;
    let unlistenComplete: (() => void) | null = null;
    let unlistenError: (() => void) | null = null;

    async function startConversion() {
      unlistenProgress = await listen<ConversionProgress>(
        "conversion-progress",
        (event) => {
          onProgress(event.payload);
        },
      );

      unlistenComplete = await listen<ConversionResult>(
        "conversion-complete",
        (event) => {
          onComplete(event.payload);
        },
      );

      unlistenError = await listen<{ message: string }>(
        "conversion-error",
        (event) => {
          setError(event.payload.message);
        },
      );

      try {
        await invoke("convert_pdf", {
          path: pdfPath,
          format: settings.format,
          quality: settings.format === "jpeg" ? settings.jpegQuality : settings.webpQuality,
          outputDir: settings.outputDirectory || "",
          namingPattern: settings.namingPattern,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }

    startConversion();

    return () => {
      unlistenProgress?.();
      unlistenComplete?.();
      unlistenError?.();
    };
  }, [pdfPath, settings, onProgress, onComplete, onCancel]);

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
    // Force re-mount by resetting — parent will trigger fresh conversion
    onCancel();
  };

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
          <p
            data-selectable
            className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed"
          >
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

  return (
    <div className="h-full flex flex-col px-6 py-6 gap-6 overflow-auto">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Converting
        </h2>
        <p
          data-selectable
          className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono truncate"
        >
          {pdfFilename}
        </p>
      </div>

      <ProgressBar current={currentPage} total={totalPages || currentPage} />

      <div className="flex-1 overflow-auto">
        <PageThumbnailGrid
          thumbnails={progress}
          totalPages={totalPages || currentPage}
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
  );
}
