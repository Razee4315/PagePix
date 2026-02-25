export type ImageFormat = "png" | "jpeg" | "webp";

export type NamingPattern =
  | "filename_page_padded"   // report_page_001.png
  | "filename_number"        // report_1.png
  | "page_padded"            // page_001.png
  | "number_only";           // 001.png

export type ThemeMode = "light" | "dark" | "system";

export type AppView = "home" | "processing" | "complete" | "settings";

export interface AppSettings {
  format: ImageFormat;
  jpegQuality: number;
  webpQuality: number;
  outputDirectory: string;
  namingPattern: NamingPattern;
  theme: ThemeMode;
  autoOpenFolder: boolean;
  accentColor: string;
}

export interface ConversionProgress {
  currentPage: number;
  totalPages: number;
  thumbnailBase64: string;
}

export interface ConversionResult {
  outputDir: string;
  totalSize: number;
  pageCount: number;
  format: ImageFormat;
}

export interface RecentConversion {
  filename: string;
  pageCount: number;
  format: ImageFormat;
  timestamp: number;
  outputDir: string;
  pdfPath?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  format: "png",
  jpegQuality: 85,
  webpQuality: 80,
  outputDirectory: "",
  namingPattern: "filename_page_padded",
  theme: "system",
  autoOpenFolder: false,
  accentColor: "#3B82F6",
};

export const NAMING_PATTERN_LABELS: Record<NamingPattern, string> = {
  filename_page_padded: "report_page_001",
  filename_number: "report_1",
  page_padded: "page_001",
  number_only: "001",
};

export const ACCENT_PRESETS = [
  { label: "Blue",    value: "#3B82F6" },
  { label: "Violet",  value: "#8B5CF6" },
  { label: "Rose",    value: "#F43F5E" },
  { label: "Amber",   value: "#F59E0B" },
  { label: "Emerald", value: "#10B981" },
  { label: "Cyan",    value: "#06B6D4" },
  { label: "Orange",  value: "#F97316" },
  { label: "Pink",    value: "#EC4899" },
];
