import { useCallback } from "react";
import { motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import {
  FolderOpen,
  Sun,
  Moon,
  Monitor,
  Trash,
  Info,
} from "@phosphor-icons/react";
import { Logo } from "../components/Logo";
import type {
  AppSettings,
  ImageFormat,
  NamingPattern,
  ThemeMode,
} from "../types";
import { NAMING_PATTERN_LABELS } from "../types";

interface SettingsViewProps {
  settings: AppSettings;
  onUpdate: (patch: Partial<AppSettings>) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onClearRecent: () => void;
}

/* ---------- Sub-components ---------- */

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
  renderLabel,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
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
              layoutId="toggle-bg"
              className="absolute inset-0 bg-white dark:bg-zinc-800 rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
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

function QualitySlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
        <span className="text-sm font-mono font-medium text-zinc-700 dark:text-zinc-300">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={10}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 appearance-none cursor-pointer accent-accent"
      />
    </div>
  );
}

/* ---------- Main ---------- */

export function SettingsView({
  settings,
  onUpdate,
  theme,
  onThemeChange,
  onClearRecent,
}: SettingsViewProps) {
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
    light: <Sun size={14} weight="bold" />,
    dark: <Moon size={14} weight="bold" />,
    system: <Monitor size={14} weight="bold" />,
  };

  return (
    <div className="h-full overflow-auto px-6 py-6 space-y-8">
      {/* Format */}
      <section>
        <SectionLabel>Output Format</SectionLabel>
        <ToggleGroup<ImageFormat>
          options={["png", "jpeg", "webp"]}
          value={settings.format}
          onChange={(format) => onUpdate({ format })}
        />
      </section>

      {/* Quality (conditional) */}
      {settings.format === "jpeg" && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <SectionLabel>JPEG Quality</SectionLabel>
          <QualitySlider
            label="Compression quality"
            value={settings.jpegQuality}
            onChange={(v) => onUpdate({ jpegQuality: v })}
          />
        </motion.section>
      )}

      {settings.format === "webp" && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <SectionLabel>WebP Quality</SectionLabel>
          <QualitySlider
            label="Compression quality"
            value={settings.webpQuality}
            onChange={(v) => onUpdate({ webpQuality: v })}
          />
        </motion.section>
      )}

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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePickDirectory}
            className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <FolderOpen
              size={18}
              weight="bold"
              className="text-zinc-500 dark:text-zinc-400"
            />
          </motion.button>
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
          renderLabel={(v) => (
            <span className="flex items-center gap-1.5">
              {themeIcons[v]}
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
          )}
        />
      </section>

      {/* Clear Recent */}
      <section>
        <SectionLabel>Data</SectionLabel>
        <button
          onClick={onClearRecent}
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
  );
}
