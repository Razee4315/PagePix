import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { CheckCircle, FolderOpen, ArrowCounterClockwise } from "@phosphor-icons/react";
import { PageThumbnailGrid } from "../components/PageThumbnailGrid";
import type { ConversionResult, ConversionProgress } from "../types";

interface CompleteViewProps {
  result: ConversionResult;
  thumbnails: ConversionProgress[];
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
  onConvertAnother,
}: CompleteViewProps) {
  const handleOpenFolder = async () => {
    try {
      await invoke("open_output_folder", { path: result.outputDir });
    } catch (err) {
      console.error("Failed to open folder:", err);
    }
  };

  return (
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
      <div
        data-selectable
        className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-xs font-mono text-zinc-500 dark:text-zinc-400 truncate"
      >
        {result.outputDir}
      </div>

      {/* Thumbnail Grid */}
      <div className="flex-1 overflow-auto">
        <PageThumbnailGrid thumbnails={thumbnails} totalPages={result.pageCount} />
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
  );
}
