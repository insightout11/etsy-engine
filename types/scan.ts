export interface ScanOptions {
  sampleSize: 20 | 50 | 100;
  includeReviews: boolean;
  region?: string;
  language?: string;
  detailDepth: "standard" | "deep";
  forceRefresh?: boolean;
}

export type ScanStatus =
  | "queued"
  | "fetching"
  | "analyzing"
  | "drafting"
  | "complete"
  | "error"
  | "needs_review";

export interface ScanRecord {
  id: number;
  keyword: string;
  createdAt: Date;
  options: ScanOptions;
  status: ScanStatus;
  errorMessage?: string;
}

export type DecisionValue = "build" | "kill" | "hold";

export interface ProgressEvent {
  phase: ScanStatus;
  message: string;
  progress?: number; // 0–100
  listingCount?: number;
  warnings?: string[];
}
