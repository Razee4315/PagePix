import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import {
  FolderOpen,
  Sun,
  Moon,
  Monitor,
  Trash,
  Check,
} from "@phosphor-icons/react";
import { Logo } from "../components/Logo";
import { ConfirmDialog } from "../components/ConfirmDialog";
import type {
  AppSettings,
  ImageFormat,
  NamingPattern,
  ThemeMode,
} from "../types";
import { NAMING_PATTERN_LABELS, ACCENT_PRESETS } from "../types";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onClearRecent: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
      {children}
    </h3>
  );
}

function ToggleGroup<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  renderLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  layoutId: string;
  renderLabel?: (v: T) => React.ReactNode;
}) {
  return (
    <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`relative px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
            value === opt
              ? "text-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          {value === opt && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
          )}
          <span className="relative z-10">
            {renderLabel ? renderLabel(opt) : opt.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );
}

export function SettingsView({
  settings,
  onUpdate,
  theme,
  onThemeChange,
  onClearRecent,
}: SettingsViewProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handlePickDirectory = useCallback(async () => {
    try {
      const selected = await open({ directory: true, multiple: false });
      if (selected) {
        onUpdate({ outputDirectory: selected as string });
      }
    } catch {
      // cancelled
    }
  }, [onUpdate]);

  const themeIcons: Record<ThemeMode, React.ReactNode> = {
    light: <Sun size={13} weight="bold" />,
    dark: <Moon size={13} weight="bold" />,
    system: <Monitor size={13} weight="bold" />,
  };

  return (
    <>
    <div className="h-full overflow-auto px-6 py-6 space-y-7">
      {/* Format */}
      <section>
        <SectionLabel>Output Format</SectionLabel>
        <ToggleGroup<ImageFormat>
          options={["png", "jpeg", "webp"]}
          value={settings.format}
          onChange={(format) => onUpdate({ format })}
          layoutId="format-toggle"
        />
      </section>

      {/* JPEG Quality - shown only when JPEG is selected */}
      <AnimatePresence>
        {settings.format === "jpeg" && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <SectionLabel>JPEG Quality</SectionLabel>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={settings.jpegQuality}
                onChange={(e) => onUpdate({ jpegQuality: Number(e.target.value) })}
                className="flex-1 accent-[var(--color-accent)]"
              />
              <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 w-10 text-right">
                {settings.jpegQuality}%
              </span>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* WebP Quality - shown only when WebP is selected */}
      <AnimatePresence>
        {settings.format === "webp" && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <SectionLabel>WebP Quality</SectionLabel>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={settings.webpQuality}
                onChange={(e) => onUpdate({ webpQuality: Number(e.target.value) })}
                className="flex-1 accent-[var(--color-accent)]"
              />
              <span className="text-sm font-mono text-zinc-600 dark:text-zinc-400 w-10 text-right">
                {settings.webpQuality}%
              </span>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Output Directory */}
      <section>
        <SectionLabel>Output Directory</SectionLabel>
        <div className="flex items-center gap-2">
          <div
            data-selectable
            className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-sm font-mono text-zinc-600 dark:text-zinc-400 truncate"
          >
            {settings.outputDirectory || "Same as PDF location"}
          </div>
          <button
            onClick={handlePickDirectory}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <FolderOpen size={18} weight="bold" className="text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>
      </section>

      {/* Naming Pattern */}
      <section>
        <SectionLabel>Naming Pattern</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          {(
            Object.entries(NAMING_PATTERN_LABELS) as [NamingPattern, string][]
          ).map(([pattern, label]) => (
            <button
              key={pattern}
              onClick={() => onUpdate({ namingPattern: pattern })}
              className={`px-3 py-2.5 rounded-xl text-sm font-mono text-left transition-all ${
                settings.namingPattern === pattern
                  ? "bg-accent/10 text-accent ring-1 ring-accent/30"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {label}.{settings.format}
            </button>
          ))}
        </div>
      </section>

      {/* Appearance */}
      <section>
        <SectionLabel>Appearance</SectionLabel>
        <ToggleGroup<ThemeMode>
          options={["light", "dark", "system"]}
          value={theme}
          onChange={onThemeChange}
          layoutId="theme-toggle"
          renderLabel={(v) => (
            <span className="flex items-center gap-1.5">
              {themeIcons[v]}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
          )}
        />
      </section>

      {/* Auto-open folder */}
      <section>
        <SectionLabel>After Conversion</SectionLabel>
        <button
          onClick={() => onUpdate({ autoOpenFolder: !settings.autoOpenFolder })}
          className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Automatically open output folder
          </span>
          <div
            className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${
              settings.autoOpenFolder
                ? "bg-accent"
                : "bg-zinc-300 dark:bg-zinc-700"
            }`}
          >
            <motion.div
              animate={{ x: settings.autoOpenFolder ? 16 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
            />
          </div>
        </button>
      </section>

      {/* Accent Color */}
      <section>
        <SectionLabel>Accent Color</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {ACCENT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onUpdate({ accentColor: preset.value })}
              className="relative w-8 h-8 rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: preset.value }}
              title={preset.label}
            >
              {settings.accentColor === preset.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check size={14} weight="bold" className="text-white drop-shadow-sm" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Clear Recent */}
      <section>
        <SectionLabel>Data</SectionLabel>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash size={16} weight="bold" />
          Clear recent conversions
        </button>
      </section>

      {/* About */}
      <section className="pb-8">
        <SectionLabel>About</SectionLabel>
        <div className="flex items-center gap-3">
          <Logo size={32} />
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              PagePix
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              v0.1.0 &middot; Built with Tauri + React
            </p>
          </div>
        </div>
      </section>
    </div>

    {/* Confirm clear dialog */}
    <AnimatePresence>
      {showClearConfirm && (
        <ConfirmDialog
          title="Clear recent conversions"
          message="This will remove all your conversion history. This action cannot be undone."
          confirmLabel="Clear All"
          onConfirm={() => {
            onClearRecent();
            setShowClearConfirm(false);
          }}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
