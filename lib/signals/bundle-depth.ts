import type { EtsyListing } from "@/types/etsy";
import type { BundleDepthResult } from "@/types/signals";
import { round } from "@/lib/utils/math";

const INCLUDES_PATTERN = /includes?\s+(\d+)\s+\w+/gi;

export function computeBundleDepth(listings: EtsyListing[]): BundleDepthResult {
  const counts: number[] = [];
  const examples: string[] = [];

  for (const listing of listings) {
    const matches = Array.from(listing.title.matchAll(INCLUDES_PATTERN));
    for (const match of matches) {
      const count = parseInt(match[1], 10);
      if (!isNaN(count)) {
        counts.push(count);
        if (examples.length < 5) {
          examples.push(match[0]);
        }
      }
    }
  }

  if (counts.length === 0) {
    return { avgIncludesCount: 0, maxIncludesCount: 0, examples: [] };
  }

  const avg = counts.reduce((s, n) => s + n, 0) / counts.length;
  const max = Math.max(...counts);

  return {
    avgIncludesCount: round(avg, 1),
    maxIncludesCount: max,
    examples,
  };
}
