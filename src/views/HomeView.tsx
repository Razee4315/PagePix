import { useCallback } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { DropZone } from "../components/DropZone";
import { RecentConversions } from "../components/RecentConversions";
import type { RecentConversion } from "../types";

interface HomeViewProps {
  onFileSelected: (filePath: string) => void;
  recent: RecentConversion[];
}

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
    <div className="h-full flex flex-col items-center justify-center gap-8 px-6 py-8">
      <DropZone onFileSelected={onFileSelected} onBrowse={handleBrowse} />
      <RecentConversions recent={recent} />
    </div>
  );
}
