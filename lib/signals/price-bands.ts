import type { EtsyListing } from "@/types/etsy";
import type { PriceBands, PriceBucket } from "@/types/signals";
import { percentile, mean, round } from "@/lib/utils/math";

const BUCKET_SIZE = 5; // $5-wide buckets

export function computePriceBands(listings: EtsyListing[]): PriceBands {
  if (listings.length === 0) {
    return {
      min: 0, max: 0, median: 0, p25: 0, p75: 0, mean: 0,
      modeBucket: "N/A", buckets: [],
    };
  }

  const prices = listings
    .map((l) => l.price.amount / l.price.divisor)
    .sort((a, b) => a - b);

  const minPrice = prices[0];
  const maxPrice = prices[prices.length - 1];
  const p25 = percentile(prices, 25);
  const p50 = percentile(prices, 50);
  const p75 = percentile(prices, 75);
  const meanPrice = mean(prices);

  // Build $5-wide buckets from 0 to max + BUCKET_SIZE
  const buckets: PriceBucket[] = [];
  // Add epsilon so a price exactly on a boundary (e.g. $25 → $25–$30) is always covered
  const bucketMax = Math.ceil((maxPrice + 1e-9) / BUCKET_SIZE) * BUCKET_SIZE;

  for (let start = 0; start < bucketMax; start += BUCKET_SIZE) {
    const end = start + BUCKET_SIZE;
    const count = prices.filter((p) => p >= start && p < end).length;
    buckets.push({
      label: `$${start}–$${end}`,
      min: start,
      max: end,
      count,
      share: round(count / listings.length, 3),
    });
  }

  // Mode bucket = highest count bucket
  const modeBucket = buckets.reduce(
    (best, b) => (b.count > best.count ? b : best),
    buckets[0]
  );

  return {
    min: round(minPrice),
    max: round(maxPrice),
    median: round(p50),
    p25: round(p25),
    p75: round(p75),
    mean: round(meanPrice),
    modeBucket: modeBucket?.label ?? "N/A",
    buckets,
  };
}
