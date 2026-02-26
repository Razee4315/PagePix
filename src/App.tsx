import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { open } from "@tauri-apps/plugin-dialog";
import { TitleBar } from "./components/TitleBar";
import { HomeView } from "./views/HomeView";
import { ProcessingView } from "./views/ProcessingView";
import { CompleteView } from "./views/CompleteView";
import { SettingsView } from "./views/SettingsView";
import { useTheme } from "./hooks/useTheme";
import { useSettings } from "./hooks/useSettings";
import { useRecentConversions } from "./hooks/useRecentConversions";
import type { AppView, ConversionProgress, ConversionResult } from "./types";

const viewVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: {
    opacity: 0,
    y: -6,
    filter: "blur(4px)",
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

function App() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { recent, addRecent, clearRecent } = useRecentConversions();

  const [currentView, setCurrentView] = useState<AppView>("home");
  const previousViewRef = useRef<AppView>("home");
  const [pdfPath, setPdfPath] = useState<string>("");
  const [pdfFilename, setPdfFilename] = useState<string>("");
  const [progress, setProgress] = useState<ConversionProgress[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [pageRange, setPageRange] = useState<string>("");

  const navigateTo = useCallback((view: AppView) => {
    // Save where we're coming from before navigating
    previousViewRef.current = currentView;
    setCurrentView(view);
  }, [currentView]);

  const navigateBack = useCallback(() => {
    // Go back to where the user came from (default to home)
    const prev = previousViewRef.current;
    // Only go back to home or complete, never back to processing/settings
    const target = prev === "complete" ? "complete" : "home";
    setCurrentView(target);
  }, []);

  // Apply accent color to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const hex = settings.accentColor || "#3B82F6";
    root.style.setProperty("--color-accent", hex);

    // Compute a darker hover variant (~15% darker)
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const darken = (v: number) => Math.max(0, Math.round(v * 0.82));
    const hover = `#${darken(r).toString(16).padStart(2, "0")}${darken(g).toString(16).padStart(2, "0")}${darken(b).toString(16).padStart(2, "0")}`;
    root.style.setProperty("--color-accent-hover", hover);

    // Lighter variant for backgrounds
    const lighten = (v: number) => Math.min(255, Math.round(v + (255 - v) * 0.85));
    const light = `#${lighten(r).toString(16).padStart(2, "0")}${lighten(g).toString(16).padStart(2, "0")}${lighten(b).toString(16).padStart(2, "0")}`;
    root.style.setProperty("--color-accent-light", light);
  }, [settings.accentColor]);

  const cycleTheme = useCallback(() => {
    // Title bar toggle: just light ↔ dark. System option is in Settings.
    const resolvedCurrent = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme;
    setTheme(resolvedCurrent === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleFileSelected = useCallback((filePath: string) => {
    const filename = filePath.split(/[/\\]/).pop() ?? "document.pdf";
    setPdfPath(filePath);
    setPdfFilename(filename);
    setProgress([]);
    setTotalPages(0);
    setResult(null);
    setPageRange("");
    setCurrentView("processing");
  }, []);

  const handleConversionProgress = useCallback((data: ConversionProgress) => {
    setTotalPages(data.totalPages);
    setProgress((prev) => [...prev, data]);
  }, []);

  const handleConversionComplete = useCallback(
    (data: ConversionResult) => {
      setResult(data);
      setCurrentView("complete");
      addRecent({
        filename: pdfFilename,
        pageCount: data.pageCount,
        format: data.format,
        timestamp: Date.now(),
        outputDir: data.outputDir,
        pdfPath: pdfPath,
      });
    },
    [pdfFilename, pdfPath, addRecent],
  );

  const handleCancel = useCallback(() => {
    setCurrentView("home");
    setProgress([]);
    setTotalPages(0);
  }, []);

  const handleReconvert = useCallback(
    (item: import("./types").RecentConversion) => {
      if (item.pdfPath) {
        handleFileSelected(item.pdfPath);
      }
    },
    [handleFileSelected],
  );

  const handleConvertAnother = useCallback(() => {
    setPdfPath("");
    setPdfFilename("");
    setProgress([]);
    setTotalPages(0);
    setResult(null);
    setPageRange("");
    setCurrentView("home");
  }, []);

  // Keep a ref to currentView so the keyboard handler always sees the latest
  const viewRef = useRef(currentView);
  viewRef.current = currentView;

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        if (viewRef.current === "home" || viewRef.current === "complete") {
          open({
            multiple: false,
            filters: [{ name: "PDF Documents", extensions: ["pdf"] }],
          }).then((selected) => {
            if (selected) handleFileSelected(selected as string);
          }).catch(() => {});
        }
      }

      if (e.key === "Escape") {
        if (viewRef.current === "settings") {
          navigateBack();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFileSelected, navigateBack]);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 rounded-lg overflow-hidden">
      <TitleBar
        theme={theme}
        resolvedTheme={resolvedTheme}
        onThemeToggle={cycleTheme}
        currentView={currentView}
        onNavigate={navigateTo}
        onBack={navigateBack}
      />

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.div key="home" className="h-full" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <HomeView onFileSelected={handleFileSelected} recent={recent} onReconvert={handleReconvert} />
            </motion.div>
          )}

          {currentView === "processing" && (
            <motion.div key="processing" className="h-full" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <ProcessingView
                pdfPath={pdfPath}
                pdfFilename={pdfFilename}
                settings={settings}
                progress={progress}
                totalPages={totalPages}
                pageRange={pageRange}
                onPageRangeChange={setPageRange}
                onProgress={handleConversionProgress}
                onComplete={handleConversionComplete}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {currentView === "complete" && (
            <motion.div key="complete" className="h-full" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <CompleteView
                result={result!}
                thumbnails={progress}
                autoOpenFolder={settings.autoOpenFolder}
                onConvertAnother={handleConvertAnother}
              />
            </motion.div>
          )}

          {currentView === "settings" && (
            <motion.div key="settings" className="h-full" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <SettingsView
                settings={settings}
                onUpdate={updateSettings}
                theme={theme}
                onThemeChange={setTheme}
                onClearRecent={clearRecent}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
