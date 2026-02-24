import type { EtsyListing } from "@/types/etsy";
import type { FormatSignals } from "@/types/signals";

const FORMAT_PATTERNS: Record<keyof Omit<FormatSignals, "distinctTypeCount">, RegExp> = {
  editable: /\beditable\b/i,
  canva: /\bcanva\b/i,
  googleSheets: /google\s+sheets?/i,
  notion: /\bnotion\b/i,
  pdf: /\bpdf\b/i,
  bundleKitSystem: /\b(bundle|kit|system|collection|set)\b/i,
  instantDownload: /instant\s+download/i,
};

function getSearchText(listing: EtsyListing): string {
  const tagText = Array.isArray(listing.tags) ? listing.tags.join(" ") : "";
  return `${listing.title} ${tagText}`;
}

export function computeFormatSignals(listings: EtsyListing[]): FormatSignals {
  const counts: Record<string, number> = {
    editable: 0,
    canva: 0,
    googleSheets: 0,
    notion: 0,
    pdf: 0,
    bundleKitSystem: 0,
    instantDownload: 0,
  };

  for (const listing of listings) {
    const text = getSearchText(listing);
    for (const [key, pattern] of Object.entries(FORMAT_PATTERNS)) {
      if (pattern.test(text)) {
        counts[key]++;
      }
    }
  }

  const distinctTypeCount = Object.values(counts).filter((v) => v > 0).length;

  return {
    editable: counts.editable,
    canva: counts.canva,
    googleSheets: counts.googleSheets,
    notion: counts.notion,
    pdf: counts.pdf,
    bundleKitSystem: counts.bundleKitSystem,
    instantDownload: counts.instantDownload,
    distinctTypeCount,
  };
}
