import { useCallback } from "react";
import { Moon, Sun, Monitor, GearSix, ArrowLeft, Minus, Square, X } from "@phosphor-icons/react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Logo } from "./Logo";
import type { ThemeMode, AppView } from "../types";

interface TitleBarProps {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  onThemeToggle: () => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onBack?: () => void;
}

export function TitleBar({
  theme,
  resolvedTheme,
  onThemeToggle,
  currentView,
  onNavigate,
  onBack,
}: TitleBarProps) {
  const ThemeIcon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  const appWindow = getCurrentWindow();

  const handleMinimize = useCallback(() => {
    appWindow.minimize();
  }, [appWindow]);

  const handleMaximize = useCallback(() => {
    appWindow.toggleMaximize();
  }, [appWindow]);

  const handleClose = useCallback(() => {
    appWindow.close();
  }, [appWindow]);

  return (
    <header
      data-tauri-drag-region
      className="flex items-center justify-between pl-4 pr-0 h-11 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shrink-0"
    >
      {/* Left: Logo / Back + Title */}
      <div data-tauri-drag-region className="flex items-center gap-2.5">
        {currentView === "settings" ? (
          <button
            onClick={() => onBack ? onBack() : onNavigate("home")}
            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Back"
          >
            <ArrowLeft size={16} weight="bold" className="text-zinc-500 dark:text-zinc-400" />
          </button>
        ) : (
          <Logo size={22} />
        )}
        <span
          data-tauri-drag-region
          className="text-[13px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-200"
        >
          {currentView === "settings" ? "Settings" : "PagePix"}
        </span>
      </div>

      {/* Right: Actions + Window Controls */}
      <div className="flex items-center h-full">
        {/* App actions */}
        <div className="flex items-center gap-0.5 px-2">
          <button
            onClick={onThemeToggle}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon size={15} weight="bold" className="text-zinc-500 dark:text-zinc-400" />
          </button>

          {currentView !== "settings" && (
            <button
              onClick={() => onNavigate("settings")}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Settings"
            >
              <GearSix size={15} weight="bold" className="text-zinc-500 dark:text-zinc-400" />
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800" />

        {/* Window controls */}
        <button
          onClick={handleMinimize}
          className="inline-flex items-center justify-center w-11 h-11 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Minimize"
        >
          <Minus size={14} weight="bold" className="text-zinc-500 dark:text-zinc-400" />
        </button>
        <button
          onClick={handleMaximize}
          className="inline-flex items-center justify-center w-11 h-11 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Maximize"
        >
          <Square size={12} weight="bold" className="text-zinc-500 dark:text-zinc-400" />
        </button>
        <button
          onClick={handleClose}
          className="inline-flex items-center justify-center w-11 h-11 hover:bg-red-500 group transition-colors rounded-tr-none"
          title="Close"
        >
          <X size={14} weight="bold" className="text-zinc-500 dark:text-zinc-400 group-hover:text-white" />
        </button>
      </div>
    </header>
  );
}
