import { useCallback } from "react";
import { motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { Images, Lightning, FolderSimple, ClockCounterClockwise } from "@phosphor-icons/react";
import { DropZone } from "../components/DropZone";
import { RecentConversions } from "../components/RecentConversions";
import { Logo } from "../components/Logo";
import type { RecentConversion } from "../types";

interface HomeViewProps {
  onFileSelected: (filePath: string) => void;
  recent: RecentConversion[];
}

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 22 } },
};

export function HomeView({ onFileSelected, recent }: HomeViewProps) {
  const handleBrowse = useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
      });
      if (selected) {
        onFileSelected(selected as string);
      }
    } catch (err) {
      console.error("File dialog error:", err);
    }
  }, [onFileSelected]);

  return (
    <div className="h-full flex flex-col overflow-auto">
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8"
      >
        {/* Hero */}
        <motion.div variants={fadeUp} className="text-center space-y-2">
          <Logo size={40} className="mx-auto mb-3" />
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            PDF to Images
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Convert every page into high-quality images, automatically organized into a folder.
          </p>
        </motion.div>

        {/* Drop Zone */}
        <motion.div variants={fadeUp}>
          <DropZone onFileSelected={onFileSelected} onBrowse={handleBrowse} />
        </motion.div>

        {/* Feature pills */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          {[
            { icon: Images, label: "PNG, JPEG, WebP" },
            { icon: Lightning, label: "300 DPI" },
            { icon: FolderSimple, label: "Auto-organized" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              <Icon size={12} weight="bold" />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Recent conversions at the bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="border-t border-zinc-200/80 dark:border-zinc-800/80 px-6 py-4"
      >
        {recent.length > 0 ? (
          <RecentConversions recent={recent} />
        ) : (
          <div className="flex items-center gap-2.5 py-2 px-1">
            <ClockCounterClockwise size={14} weight="bold" className="text-zinc-300 dark:text-zinc-700" />
            <span className="text-xs text-zinc-400 dark:text-zinc-600">
              Your recent conversions will appear here
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
