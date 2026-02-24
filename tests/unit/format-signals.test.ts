import { describe, it, expect } from "vitest";
import { computeFormatSignals } from "@/lib/signals/format-signals";
import type { EtsyListing } from "@/types/etsy";

function makeListing(title: string, tags: string[] = [], id = 1): EtsyListing {
  return {
    listing_id: id,
    shop_id: 1,
    title,
    price: { amount: 999, divisor: 100, currency_code: "USD" },
    quantity: 1,
    num_favorers: 0,
    tags,
    creation_tsz: 0,
    last_modified_tsz: 0,
    state: "active",
  };
}

describe("format-signals", () => {
  it("detects editable and PDF in title", () => {
    const listings = [makeListing("Welcome Book editable PDF template")];
    const result = computeFormatSignals(listings);
    expect(result.editable).toBe(1);
    expect(result.pdf).toBe(1);
    expect(result.canva).toBe(0);
  });

  it("detects Canva in title", () => {
    const listings = [makeListing("Welcome Book Canva Template")];
    const result = computeFormatSignals(listings);
    expect(result.canva).toBe(1);
  });

  it("detects Google Sheets with space", () => {
    const listings = [makeListing("Budget Tracker Google Sheets Template")];
    const result = computeFormatSignals(listings);
    expect(result.googleSheets).toBe(1);
  });

  it("detects Notion in title", () => {
    const listings = [makeListing("Project Dashboard Notion Template")];
    const result = computeFormatSignals(listings);
    expect(result.notion).toBe(1);
  });

  it("detects bundle keyword in title", () => {
    const listings = [makeListing("Airbnb Host Bundle | 5 Templates")];
    const result = computeFormatSignals(listings);
    expect(result.bundleKitSystem).toBe(1);
  });

  it("detects kit keyword in title", () => {
    const listings = [makeListing("Freelancer Starter Kit Templates")];
    const result = computeFormatSignals(listings);
    expect(result.bundleKitSystem).toBe(1);
  });

  it("detects instant download format", () => {
    const listings = [makeListing("Wedding Checklist Instant Download PDF")];
    const result = computeFormatSignals(listings);
    expect(result.instantDownload).toBe(1);
    expect(result.pdf).toBe(1);
  });

  it("detects format signals from tags (not just title)", () => {
    const listings = [makeListing("Welcome Book Template", ["canva", "editable"])];
    const result = computeFormatSignals(listings);
    expect(result.canva).toBe(1);
    expect(result.editable).toBe(1);
  });

  it("is case insensitive — CANVA matches canva", () => {
    const listings = [makeListing("Welcome Book CANVA EDITABLE PDF")];
    const result = computeFormatSignals(listings);
    expect(result.canva).toBe(1);
    expect(result.editable).toBe(1);
    expect(result.pdf).toBe(1);
  });

  it("no false positives — 'notional' does not match notion", () => {
    const listings = [makeListing("Notional budget planning tool spreadsheet")];
    const result = computeFormatSignals(listings);
    expect(result.notion).toBe(0);
  });

  it("distinctTypeCount counts correctly", () => {
    const listings = [
      makeListing("Welcome Book Canva PDF Editable", ["instant download"]),
    ];
    const result = computeFormatSignals(listings);
    // canva=1, pdf=1, editable=1, instantDownload=1 → 4 distinct types
    expect(result.distinctTypeCount).toBe(4);
  });
});
