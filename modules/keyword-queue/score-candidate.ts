import { getEtsyClient } from "@/lib/etsy/client";
import { computeSignals } from "@/lib/signals/index";
import {
  SIGNAL_WEIGHTS,
  CandidateScoreSchema,
  type CandidateScore,
} from "@/contracts/keyword-candidate";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export async function scoreCandidate(keyword: string): Promise<CandidateScore> {
  const client = getEtsyClient();
  const { results: listings } = await client.searchListings(keyword, 20);

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
