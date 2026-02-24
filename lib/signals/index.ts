import type { EtsyListing } from "@/types/etsy";
import type { SignalsResult } from "@/types/signals";
import { computePriceBands } from "./price-bands";
import { computeTitleSameness } from "./title-sameness";
import { computeDominance } from "./dominance";
import { computeFormatSignals } from "./format-signals";
import { computeBundleDepth } from "./bundle-depth";

export async function computeSignals(
  listings: EtsyListing[],
  keyword: string
): Promise<SignalsResult> {
  const [priceBands, titleSameness, dominance, formatSignals, bundleDepth] =
    await Promise.all([
      Promise.resolve(computePriceBands(listings)),
      Promise.resolve(computeTitleSameness(listings)),
      Promise.resolve(computeDominance(listings)),
      Promise.resolve(computeFormatSignals(listings)),
      Promise.resolve(computeBundleDepth(listings)),
    ]);

  return {
    priceBands,
    titleSameness,
    dominance,
    formatSignals,
    bundleDepth,
    listingCount: listings.length,
    keyword,
    computedAt: new Date().toISOString(),
  };
}

export { computePriceBands } from "./price-bands";
export { computeTitleSameness } from "./title-sameness";
export { computeDominance } from "./dominance";
export { computeFormatSignals } from "./format-signals";
export { computeBundleDepth } from "./bundle-depth";
