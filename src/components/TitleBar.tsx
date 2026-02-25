import { Moon, Sun, Monitor, GearSix, ArrowLeft } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import type { ThemeMode, AppView } from "../types";

interface TitleBarProps {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  onThemeToggle: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

export function TitleBar({
  theme,
  resolvedTheme,
  onThemeToggle,
  currentView,
  onNavigate,
}: TitleBarProps) {
  const ThemeIcon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  return (
    <header
      data-tauri-drag-region
      className="flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        {currentView === "settings" ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("home")}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft size={20} weight="bold" className="text-zinc-600 dark:text-zinc-400" />
          </motion.button>
        ) : (
          <Logo size={28} />
        )}
        <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          {currentView === "settings" ? "Settings" : "PagePix"}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onThemeToggle}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title={`Theme: ${theme}`}
        >
          <ThemeIcon
            size={18}
            weight="bold"
            className="text-zinc-500 dark:text-zinc-400"
          />
        </motion.button>

        {currentView !== "settings" && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate("settings")}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <GearSix
              size={18}
              weight="bold"
              className="text-zinc-500 dark:text-zinc-400"
            />
          </motion.button>
        )}
      </div>
    </header>
  );
}
