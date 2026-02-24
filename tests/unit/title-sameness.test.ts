import { describe, it, expect } from "vitest";
import { computeTitleSameness } from "@/lib/signals/title-sameness";
import type { EtsyListing } from "@/types/etsy";

function makeListing(title: string, id = 1): EtsyListing {
  return {
    listing_id: id,
    shop_id: 1,
    title,
    price: { amount: 999, divisor: 100, currency_code: "USD" },
    quantity: 1,
    num_favorers: 0,
    tags: [],
    creation_tsz: 0,
    last_modified_tsz: 0,
    state: "active",
  };
}

describe("title-sameness", () => {
  it("identical titles produce averageSimilarity of 1.0", () => {
    const listings = [
      makeListing("Airbnb Welcome Book Template Canva Editable", 1),
      makeListing("Airbnb Welcome Book Template Canva Editable", 2),
      makeListing("Airbnb Welcome Book Template Canva Editable", 3),
    ];
    const result = computeTitleSameness(listings);
    expect(result.averageSimilarity).toBeCloseTo(1.0, 2);
  });

  it("completely different titles produce low similarity", () => {
    const listings = [
      makeListing("Red bicycle for children outdoor fun", 1),
      makeListing("Python programming tutorial advanced", 2),
      makeListing("Vintage ceramic kitchen coffee mug", 3),
    ];
    const result = computeTitleSameness(listings);
    expect(result.averageSimilarity).toBeLessThan(0.1);
  });

  it("top phrases includes the most repeated bigram", () => {
    const listings = [
      makeListing("Airbnb Welcome Book Template Canva", 1),
      makeListing("Airbnb Welcome Book Editable PDF", 2),
      makeListing("Airbnb Welcome Book Instant Download", 3),
      makeListing("Airbnb Welcome Book Notion Template", 4),
    ];
    const result = computeTitleSameness(listings);
    const phrases = result.topPhrases.map((p) => p.phrase);
    // "airbnb welcome" or "welcome book" should appear
    expect(phrases.some((p) => p.includes("welcome"))).toBe(true);
  });

  it("single listing returns without error and clusterCount of 1", () => {
    const result = computeTitleSameness([makeListing("Single listing title", 1)]);
    expect(result.clusterCount).toBe(1);
    expect(result.averageSimilarity).toBe(1);
  });

  it("empty listings returns zeroed result", () => {
    const result = computeTitleSameness([]);
    expect(result.averageSimilarity).toBe(0);
    expect(result.topPhrases).toHaveLength(0);
  });

  it("special characters in titles are normalised without error", () => {
    const listings = [
      makeListing("Airbnb Welcome Book | Éditable & Canva™ Template", 1),
      makeListing("Airbnb Welcome Book — PDF | 50% Off | Instant Download", 2),
    ];
    expect(() => computeTitleSameness(listings)).not.toThrow();
    const result = computeTitleSameness(listings);
    expect(result.averageSimilarity).toBeGreaterThanOrEqual(0);
    expect(result.averageSimilarity).toBeLessThanOrEqual(1);
  });
});
