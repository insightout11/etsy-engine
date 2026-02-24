import { z } from "zod";

const DifferentiatorSchema = z.object({
  id: z.string(),
  claim: z.string().min(20, "Claim must be at least 20 characters"),
  supportingSignal: z
    .string()
    .regex(/^[a-zA-Z]+\.[a-zA-Z]+/, "Must be in format 'topLevel.subField'"),
  evidence: z.string().min(10, "Evidence must be at least 10 characters"),
});

const MissingFeatureSchema = z.object({
  feature: z.string().min(5),
  rationale: z.string().min(10),
  supportingSignal: z.string(),
});

const BuyerFrictionSchema = z.object({
  friction: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  sourceReviews: z.array(z.string()),
});

const PremiumTierSchema = z.object({
  tier: z.enum(["good", "better", "best"]),
  label: z.string(),
  features: z.array(z.string()).min(2),
  suggestedPriceRange: z.string(),
});

const RiskFlagSchema = z.object({
  flag: z.string(),
  severity: z.enum(["red", "yellow", "green"]),
  mitigation: z.string(),
});

export const DifferentiationBriefSchema = z.object({
  version: z.literal("1.0"),
  scanId: z.number(),
  keyword: z.string(),
  generatedAt: z.string(),
  marketStandard: z.object({
    summary: z.string().min(20),
    typicalFormats: z.array(z.string()).min(1),
    typicalPriceRange: z.string(),
  }),
  differentiators: z
    .array(DifferentiatorSchema)
    .min(5, "At least 5 differentiators required"),
  missingFeatures: z
    .array(MissingFeatureSchema)
    .min(3, "At least 3 missing features required"),
  buyerFrictions: z.array(BuyerFrictionSchema),
  winningBuildSpec: z.object({
    coreProblemSolved: z.string().min(10),
    mustHaveFeatures: z.array(z.string()).min(3),
    mustAvoid: z.array(z.string()),
  }),
  premiumLadder: z
    .array(PremiumTierSchema)
    .length(3, "Exactly 3 premium tiers required"),
  listingAngle: z.object({
    headline: z.string(),
    subheadline: z.string(),
    imageCallouts: z.array(z.string()).min(3),
  }),
  riskFlags: z.array(RiskFlagSchema).min(1),
});

export type DifferentiationBriefOutput = z.infer<typeof DifferentiationBriefSchema>;
