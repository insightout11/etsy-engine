import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing the module under test
vi.mock("@/lib/db/client", () => ({
  prisma: {
    keywordCandidate: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

import { expandSeeds } from "@/modules/keyword-queue/expand-seeds";
import { prisma } from "@/lib/db/client";

beforeEach(() => {
  process.env.LLM_PROVIDER = "mock";
  vi.mocked(prisma.keywordCandidate.findMany).mockResolvedValue([]);
});

describe("expandSeeds", () => {
  it("returns 20 variants for a single seed in mock mode", async () => {
    const result = await expandSeeds(["wedding planner"]);
    expect(result).toHaveLength(20);
  });

  it("deduplicates variants across seeds", async () => {
    // "planner" generates "planner printable" (index 1)
    // "planner printable" generates "planner printable" (index 0 — the seed itself)
    // They collide → deduplicated to one entry
    const result = await expandSeeds(["planner", "planner printable"]);
    const count = result.filter((kw) => kw === "planner printable").length;
    expect(count).toBe(1);
  });

  it("normalises whitespace and casing in all variants", async () => {
    const result = await expandSeeds(["  Wedding  PLANNER  "]);
    for (const kw of result) {
      expect(kw).toBe(kw.toLowerCase());
      expect(kw).not.toMatch(/\s{2,}/);
      expect(kw).toBe(kw.trim());
    }
  });

  it("enforces 400 total cap across many seeds", async () => {
    // 21 unique seeds × 20 variants = 420 → should truncate to 400
    const seeds = Array.from({ length: 21 }, (_, i) => `uniqueseed${i}`);
    const result = await expandSeeds(seeds);
    expect(result.length).toBe(400);
  });

  it("filters out keywords already in DB", async () => {
    vi.mocked(prisma.keywordCandidate.findMany).mockResolvedValueOnce([
      {
        id: 1,
        keyword: "wedding planner printable",
        seed: null,
        track: "digital",
        status: "new",
        score: null,
        scoreJson: null,
        notes: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await expandSeeds(["wedding planner"]);
    expect(result).not.toContain("wedding planner printable");
    // 19 variants remain (20 minus the filtered one)
    expect(result.length).toBe(19);
  });

  it("returns an empty array for empty seeds input", async () => {
    const result = await expandSeeds([]);
    expect(result).toEqual([]);
  });
});
