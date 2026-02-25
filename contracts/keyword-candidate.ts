import { z } from "zod";

export const SIGNAL_WEIGHTS = {
  titleSameness: 0.2,
  dominance: 0.2,
  priceBands: 0.2,
  formatDiversity: 0.2,
  bundleDepth: 0.2,
} as const;

export const CandidateScoreSchema = z.object({
  composite: z.number().min(0).max(100),
  signals: z.object({
    titleSamenessScore:    z.number().min(0).max(100),
    dominanceScore:        z.number().min(0).max(100),
    priceBandsScore:       z.number().min(0).max(100),
    formatDiversityScore:  z.number().min(0).max(100),
    bundleDepthScore:      z.number().min(0).max(100),
  }),
  weights: z.object({
    titleSameness:   z.number(),
    dominance:       z.number(),
    priceBands:      z.number(),
    formatDiversity: z.number(),
    bundleDepth:     z.number(),
  }),
  listingCount: z.number(),
  computedAt:   z.string(),
});

export type CandidateScore = z.infer<typeof CandidateScoreSchema>;
