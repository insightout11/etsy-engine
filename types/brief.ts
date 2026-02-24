export interface Differentiator {
  id: string; // "D1", "D2", etc.
  claim: string;
  supportingSignal: string; // e.g. "titleSameness.topPhrases"
  evidence: string; // specific data cited
}

export interface MissingFeature {
  feature: string;
  rationale: string;
  supportingSignal: string;
}

export interface BuyerFriction {
  friction: string;
  severity: "high" | "medium" | "low";
  sourceReviews: string[];
}

export interface PremiumTier {
  tier: "good" | "better" | "best";
  label: string;
  features: string[];
  suggestedPriceRange: string;
}

export interface ListingAngle {
  headline: string;
  subheadline: string;
  imageCallouts: string[];
}

export interface RiskFlag {
  flag: string;
  severity: "red" | "yellow" | "green";
  mitigation: string;
}

export interface DifferentiationBrief {
  version: "1.0";
  scanId: number;
  keyword: string;
  generatedAt: string;
  marketStandard: {
    summary: string;
    typicalFormats: string[];
    typicalPriceRange: string;
  };
  differentiators: Differentiator[];
  missingFeatures: MissingFeature[];
  buyerFrictions: BuyerFriction[]; // empty if reviews disabled
  winningBuildSpec: {
    coreProblemSolved: string;
    mustHaveFeatures: string[];
    mustAvoid: string[];
  };
  premiumLadder: PremiumTier[];
  listingAngle: ListingAngle;
  riskFlags: RiskFlag[];
}
