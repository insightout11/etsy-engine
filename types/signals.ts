export interface PriceBucket {
  label: string;
  min: number;
  max: number;
  count: number;
  share: number; // 0–1
}

export interface PriceBands {
  min: number;
  max: number;
  median: number;
  p25: number;
  p75: number;
  mean: number;
  modeBucket: string;
  buckets: PriceBucket[];
}

export interface TopPhrase {
  phrase: string;
  count: number;
  score: number; // combined TF-IDF
}

export interface TitleSamenessResult {
  averageSimilarity: number; // 0–1; high = homogeneous market
  topPhrases: TopPhrase[];
  clusterCount: number;
}

export interface ShopShare {
  shopId: string;
  listingCount: number;
  sharePercent: number;
}

export interface DominanceResult {
  topShops: ShopShare[];
  top3SharePercent: number;
  isConcentrated: boolean; // true if top3Share > 40%
}

export interface FormatSignals {
  editable: number;
  canva: number;
  googleSheets: number;
  notion: number;
  pdf: number;
  bundleKitSystem: number;
  instantDownload: number;
  distinctTypeCount: number; // how many format types have count > 0
}

export interface BundleDepthResult {
  avgIncludesCount: number;
  maxIncludesCount: number;
  examples: string[];
}

export interface SignalsResult {
  priceBands: PriceBands;
  titleSameness: TitleSamenessResult;
  dominance: DominanceResult;
  formatSignals: FormatSignals;
  bundleDepth: BundleDepthResult;
  listingCount: number;
  keyword: string;
  computedAt: string; // ISO timestamp
}

export type SignalRiskLevel = "red" | "yellow" | "green";

export interface SignalTile {
  label: string;
  value: string; // formatted numeric value
  rawValue: number;
  level: SignalRiskLevel;
  threshold: string; // e.g. "< 30% = green"
  interpretation: string; // one-line human readable
}
