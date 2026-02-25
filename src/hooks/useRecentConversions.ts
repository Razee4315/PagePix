import { useState, useCallback } from "react";
import type { RecentConversion } from "../types";

const STORAGE_KEY = "pagepix-recent";
const MAX_RECENT = 10;

function loadRecent(): RecentConversion[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

export function useRecentConversions() {
  const [recent, setRecent] = useState<RecentConversion[]>(loadRecent);

  const addRecent = useCallback((entry: RecentConversion) => {
    setRecent((prev) => {
      const next = [entry, ...prev].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearRecent = useCallback(() => {
    setRecent([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { recent, addRecent, clearRecent };
}
