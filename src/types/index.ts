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
}

export const DEFAULT_SETTINGS: AppSettings = {
  format: "png",
  jpegQuality: 85,
  webpQuality: 80,
  outputDirectory: "",
  namingPattern: "filename_page_padded",
  theme: "system",
};

export const NAMING_PATTERN_LABELS: Record<NamingPattern, string> = {
  filename_page_padded: "report_page_001",
  filename_number: "report_1",
  page_padded: "page_001",
  number_only: "001",
};
