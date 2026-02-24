import type { EtsyListing } from "@/types/etsy";
import type { DominanceResult, ShopShare } from "@/types/signals";
import { round } from "@/lib/utils/math";

export function computeDominance(listings: EtsyListing[]): DominanceResult {
  if (listings.length === 0) {
    return { topShops: [], top3SharePercent: 0, isConcentrated: false };
  }

  const shopCount = new Map<string, number>();
  for (const l of listings) {
    const id = String(l.shop_id);
    shopCount.set(id, (shopCount.get(id) ?? 0) + 1);
  }

  const sorted = Array.from(shopCount.entries())
    .sort((a, b) => b[1] - a[1]);

  const top3 = sorted.slice(0, 3);
  const top3Total = top3.reduce((s, [, c]) => s + c, 0);
  const top3SharePercent = round((top3Total / listings.length) * 100, 1);

  const topShops: ShopShare[] = top3.map(([shopId, count]) => ({
    shopId,
    listingCount: count,
    sharePercent: round((count / listings.length) * 100, 1),
  }));

  return {
    topShops,
    top3SharePercent,
    isConcentrated: top3SharePercent > 40,
  };
}
