import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SignalsResult } from "@/types/signals";

// Mock etsy client before module import
vi.mock("@/lib/etsy/client", () => ({
  getEtsyClient: () => ({
    searchListings: vi.fn().mockResolvedValue({ count: 20, results: [] }),
  }),
}));

// Mock computeSignals so we can control signal values
vi.mock("@/lib/signals/index", () => ({
  computeSignals: vi.fn(),
}));

import { scoreCandidate } from "@/modules/keyword-queue/score-candidate";
import { CandidateScoreSchema, SIGNAL_WEIGHTS } from "@/contracts/keyword-candidate";
import { computeSignals } from "@/lib/signals/index";

function makeSignals(overrides: Partial<SignalsResult> = {}): SignalsResult {
  return {
    priceBands: {
      min: 5,
      max: 50,
      median: 15,
      p25: 10,
      p75: 30,
      mean: 18,
      modeBucket: "$10-$15",
      buckets: [],
    },
    titleSameness: {
      averageSimilarity: 0.3,
      topPhrases: [],
      clusterCount: 3,
    },
    dominance: {
      topShops: [],
      top3SharePercent: 40,
      isConcentrated: false,
    },
    formatSignals: {
      editable: 5,
      canva: 8,
      googleSheets: 2,
      notion: 1,
      pdf: 6,
      bundleKitSystem: 2,
      instantDownload: 7,
      distinctTypeCount: 4,
    },
    bundleDepth: {
      avgIncludesCount: 2,
      maxIncludesCount: 8,
      examples: [],
    },
    listingCount: 20,
    keyword: "test keyword",
    computedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(computeSignals).mockResolvedValue(makeSignals());
});

describe("scoreCandidate", () => {
  it("returns a score that passes CandidateScore Zod validation", async () => {
    const score = await scoreCandidate("test keyword");
    expect(() => CandidateScoreSchema.parse(score)).not.toThrow();
  });

  it("composite score is within [0, 100]", async () => {
    const score = await scoreCandidate("test keyword");
    expect(score.composite).toBeGreaterThanOrEqual(0);
    expect(score.composite).toBeLessThanOrEqual(100);
  });

  it("each signal sub-score is within [0, 100]", async () => {
    const score = await scoreCandidate("test keyword");
    for (const val of Object.values(score.signals)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    }
  });

  it("signal weights sum to 1.0", async () => {
    const score = await scoreCandidate("test keyword");
    const total = Object.values(score.weights).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1.0);
  });

  it("high title sameness produces low titleSamenessScore (< 30)", async () => {
    vi.mocked(computeSignals).mockResolvedValueOnce(
      makeSignals({
        titleSameness: { averageSimilarity: 0.8, topPhrases: [], clusterCount: 2 },
      })
    );
    const score = await scoreCandidate("high sameness keyword");
    // (1 - 0.8) * 100 = 20
    expect(score.signals.titleSamenessScore).toBeLessThan(30);
  });

  it("zero dominance produces dominanceScore of 100", async () => {
    vi.mocked(computeSignals).mockResolvedValueOnce(
      makeSignals({
        dominance: { topShops: [], top3SharePercent: 0, isConcentrated: false },
      })
    );
    const score = await scoreCandidate("zero dominance keyword");
    expect(score.signals.dominanceScore).toBe(100);
  });
});

describe("SIGNAL_WEIGHTS", () => {
  it("all weights sum to exactly 1.0", () => {
    const total = Object.values(SIGNAL_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1.0);
  });
});
