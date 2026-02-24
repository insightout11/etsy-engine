import { describe, it, expect } from "vitest";
import { computePriceBands } from "@/lib/signals/price-bands";
import { percentile } from "@/lib/utils/math";
import type { EtsyListing } from "@/types/etsy";

function makeListing(price: number, id = 1): EtsyListing {
  return {
    listing_id: id,
    shop_id: 1,
    title: "Test",
    price: { amount: Math.round(price * 100), divisor: 100, currency_code: "USD" },
    quantity: 1,
    num_favorers: 0,
    tags: [],
    creation_tsz: 0,
    last_modified_tsz: 0,
    state: "active",
  };
}

describe("price-bands", () => {
  it("computes median of odd-length array correctly", () => {
    const prices = [1, 3, 5, 7, 9];
    const sorted = [...prices].sort((a, b) => a - b);
    expect(percentile(sorted, 50)).toBe(5);
  });

  it("computes median of even-length array using interpolation", () => {
    const prices = [2, 4, 6, 8];
    const sorted = [...prices].sort((a, b) => a - b);
    expect(percentile(sorted, 50)).toBe(5); // midpoint of 4 and 6
  });

  it("computes p25 and p75 with known dataset", () => {
    // 10 listings at $10, $20, ..., $100
    const listings = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p, i) =>
      makeListing(p, i)
    );
    const result = computePriceBands(listings);
    expect(result.p25).toBeCloseTo(32.5, 1);
    expect(result.p75).toBeCloseTo(77.5, 1);
  });

  it("mode bucket has the highest count", () => {
    // 5 listings at $7, 3 at $15, 2 at $25
    const listings = [
      ...Array(5).fill(7).map((p, i) => makeListing(p, i)),
      ...Array(3).fill(15).map((p, i) => makeListing(p, i + 5)),
      ...Array(2).fill(25).map((p, i) => makeListing(p, i + 8)),
    ];
    const result = computePriceBands(listings);
    // $7 falls in $5–$10 bucket
    expect(result.modeBucket).toBe("$5–$10");
  });

  it("single listing: all percentiles equal the price", () => {
    const listing = [makeListing(25)];
    const result = computePriceBands(listing);
    expect(result.median).toBe(25);
    expect(result.p25).toBe(25);
    expect(result.p75).toBe(25);
    expect(result.min).toBe(25);
    expect(result.max).toBe(25);
  });

  it("all same price: p25 = p50 = p75", () => {
    const listings = Array(10).fill(15).map((p, i) => makeListing(p, i));
    const result = computePriceBands(listings);
    expect(result.p25).toBe(15);
    expect(result.median).toBe(15);
    expect(result.p75).toBe(15);
  });

  it("extreme outlier does not break computation", () => {
    const listings = [
      ...Array(9).fill(10).map((p, i) => makeListing(p, i)),
      makeListing(1000, 9),
    ];
    expect(() => computePriceBands(listings)).not.toThrow();
    const result = computePriceBands(listings);
    expect(result.max).toBe(1000);
  });

  it("bucket shares sum to approximately 1.0", () => {
    const listings = [5, 10, 15, 20, 25].map((p, i) => makeListing(p, i));
    const result = computePriceBands(listings);
    const totalShare = result.buckets.reduce((s, b) => s + b.share, 0);
    expect(totalShare).toBeCloseTo(1.0, 1);
  });
});
