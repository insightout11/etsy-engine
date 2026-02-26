import fs from "fs";
import path from "path";
import { computeSignals } from "@/lib/signals/index";
import type { EtsyListing } from "@/types/etsy";
import {
  SIGNAL_WEIGHTS,
  CandidateScoreSchema,
  type CandidateScore,
} from "@/contracts/keyword-candidate";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function isFixtureMode(): boolean {
  return (
    process.env.ETSY_FIXTURE_MODE === "1" ||
    !process.env.ETSY_API_KEY ||
    !process.env.ETSY_ACCESS_TOKEN
  );
}

function loadFixture(keyword: string): EtsyListing[] {
  const kw = keyword.toLowerCase();
  let filename: string;
  if (kw.includes("wedding")) {
    filename = "wedding-planner-printable.json";
  } else if (kw.includes("budget")) {
    filename = "budget-tracker.json";
  } else {
    filename = "generic-digital.json";
  }
  const filePath = path.join(process.cwd(), "fixtures", "etsy", filename);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as EtsyListing[];
}

async function fetchListings(keyword: string): Promise<EtsyListing[]> {
  if (isFixtureMode()) {
    return loadFixture(keyword);
  }
  const { getEtsyClient } = await import("@/lib/etsy/client");
  const { results } = await getEtsyClient().searchListings(keyword, 25);
  return results;
}

export async function scoreCandidate(keyword: string): Promise<CandidateScore> {
  const listings = await fetchListings(keyword);

  const signals = await computeSignals(listings, keyword);

  const titleSamenessScore = clamp(
    (1 - signals.titleSameness.averageSimilarity) * 100,
    0,
    100
  );
  const dominanceScore = clamp(100 - signals.dominance.top3SharePercent, 0, 100);
  const spread = signals.priceBands.p75 - signals.priceBands.p25;
  const priceBandsScore = clamp((spread / 20) * 100, 0, 100);
  const formatDiversityScore = clamp(
    (signals.formatSignals.distinctTypeCount / 8) * 100,
    0,
    100
  );
  const bundleDepthScore = clamp(
    100 - signals.bundleDepth.avgIncludesCount * 10,
    0,
    100
  );

  const composite = clamp(
    titleSamenessScore * SIGNAL_WEIGHTS.titleSameness +
      dominanceScore * SIGNAL_WEIGHTS.dominance +
      priceBandsScore * SIGNAL_WEIGHTS.priceBands +
      formatDiversityScore * SIGNAL_WEIGHTS.formatDiversity +
      bundleDepthScore * SIGNAL_WEIGHTS.bundleDepth,
    0,
    100
  );

  const score: CandidateScore = {
    composite,
    signals: {
      titleSamenessScore,
      dominanceScore,
      priceBandsScore,
      formatDiversityScore,
      bundleDepthScore,
    },
    weights: { ...SIGNAL_WEIGHTS },
    listingCount: listings.length,
    computedAt: new Date().toISOString(),
  };

  return CandidateScoreSchema.parse(score);
}
