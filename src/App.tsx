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
import type { AppView, ConversionProgress, ConversionResult, ThemeMode } from "./types";

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
  const [pdfPath, setPdfPath] = useState<string>("");
  const [pdfFilename, setPdfFilename] = useState<string>("");
  const [progress, setProgress] = useState<ConversionProgress[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const cycleTheme = useCallback(() => {
    const order: ThemeMode[] = ["light", "dark", "system"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  }, [theme, setTheme]);

  const handleFileSelected = useCallback((filePath: string) => {
    const filename = filePath.split(/[/\\]/).pop() ?? "document.pdf";
    setPdfPath(filePath);
    setPdfFilename(filename);
    setProgress([]);
    setTotalPages(0);
    setResult(null);
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
      });
    },
    [pdfFilename, addRecent],
  );

  const handleCancel = useCallback(() => {
    setCurrentView("home");
    setProgress([]);
    setTotalPages(0);
  }, []);

  const handleConvertAnother = useCallback(() => {
    setPdfPath("");
    setPdfFilename("");
    setProgress([]);
    setTotalPages(0);
    setResult(null);
    setCurrentView("home");
  }, []);

  // Keep a ref to currentView so the keyboard handler always sees the latest
  const viewRef = useRef(currentView);
  viewRef.current = currentView;

  // Global keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+O — open file browser (only from home or complete view)
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

      // Esc — go back from settings, or cancel conversion
      if (e.key === "Escape") {
        if (viewRef.current === "settings") {
          setCurrentView("home");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFileSelected]);

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 rounded-lg overflow-hidden">
      <TitleBar
        theme={theme}
        resolvedTheme={resolvedTheme}
        onThemeToggle={cycleTheme}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentView === "home" && (
            <motion.div key="home" className="h-full" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <HomeView onFileSelected={handleFileSelected} recent={recent} />
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
