import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { Clock, FolderOpen } from "@phosphor-icons/react";
import type { RecentConversion } from "../types";

interface RecentConversionsProps {
  recent: RecentConversion[];
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentConversions({ recent }: RecentConversionsProps) {
  if (recent.length === 0) return null;

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Clock size={14} weight="bold" className="text-zinc-400 dark:text-zinc-500" />
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Recent
        </span>
      </div>

      <div className="space-y-1">
        {recent.slice(0, 5).map((item, i) => (
          <motion.div
            key={`${item.filename}-${item.timestamp}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            className="group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-accent uppercase">
                  {item.format}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {item.filename}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {item.pageCount} page{item.pageCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 dark:text-zinc-600">
                {timeAgo(item.timestamp)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  invoke("open_output_folder", { path: item.outputDir }).catch(console.error);
                }}
                className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                title="Open folder"
              >
                <FolderOpen size={14} className="text-zinc-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
