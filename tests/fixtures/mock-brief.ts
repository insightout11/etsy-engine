import type { DifferentiationBrief } from "@/types/brief";

/**
 * A valid DifferentiationBrief that passes all QA gates.
 * Used in QA gate unit tests as a baseline — then mutated to test gate firing.
 */
export const VALID_MOCK_BRIEF: DifferentiationBrief = {
  version: "1.0",
  scanId: 1,
  keyword: "airbnb welcome book template",
  generatedAt: new Date().toISOString(),
  marketStandard: {
    summary:
      "The airbnb welcome book template market has 50 listings with median price $11.99. Most listings are Canva-based PDFs with nearly identical title structures.",
    typicalFormats: ["Canva Template", "PDF", "Instant Download"],
    typicalPriceRange: "$7–$16",
  },
  differentiators: [
    {
      id: "D1",
      claim:
        "82% of listings are Canva-based, leaving buyers without Canva Pro entirely unserved. A Google Docs version captures this segment at no additional production cost.",
      supportingSignal: "formatSignals.canva",
      evidence: "formatSignals.canva = 41 of 50 listings (82%); formatSignals.googleSheets = 3.",
    },
    {
      id: "D2",
      claim:
        "Top 3 shops hold 42% of visible listings — entering with a fresh shop identity and 5-star positioning from launch creates visible shelf differentiation.",
      supportingSignal: "dominance.top3SharePercent",
      evidence: "dominance.top3SharePercent = 42%; dominance.topShops[0].sharePercent = 18%.",
    },
    {
      id: "D3",
      claim:
        "Title sameness score is 0.68 — the market uses near-identical phrasing. A title that avoids 'airbnb welcome book canva' construction ranks as novel in search.",
      supportingSignal: "titleSameness.averageSimilarity",
      evidence: "titleSameness.averageSimilarity = 0.68; top phrase 'airbnb welcome' appears in 41 of 50 titles.",
    },
    {
      id: "D4",
      claim:
        "Price spread from p25 to p75 is $9 — a bundle priced above $25 with clear system framing is absent from the top 50 and signals operator-level authority.",
      supportingSignal: "priceBands.p75",
      evidence: "priceBands.p25 = $8.24, priceBands.p75 = $17.49; only 6 listings priced above $20.",
    },
    {
      id: "D5",
      claim:
        "Only 18 of 50 listings include 'Instant Download' in the title despite presumably all being digital — adding this label reduces buyer hesitation at zero cost.",
      supportingSignal: "formatSignals.instantDownload",
      evidence: "formatSignals.instantDownload = 18 of 50 listings (36%).",
    },
  ],
  missingFeatures: [
    {
      feature: "Multi-format delivery (Canva + Google Docs or Word)",
      rationale:
        "With 82% of listings Canva-only, buyers on Android, school-issued Chromebooks, or without Pro subscriptions have no good option. Dual-format delivery is absent from observed top 50.",
      supportingSignal: "formatSignals.canva",
    },
    {
      feature: "Niche-specific variants (pet-friendly, luxury cabin, urban apartment)",
      rationale:
        "All 50 observed titles use generic positioning. A niche variant differentiates without competing on price and attracts a buyer segment with higher willingness to pay.",
      supportingSignal: "titleSameness.topPhrases",
    },
    {
      feature: "Video walkthrough or setup tutorial included with purchase",
      rationale:
        "None of the 50 observed listings signal a tutorial video. This eliminates the most common post-purchase friction for template buyers who are not design-savvy.",
      supportingSignal: "titleSameness.averageSimilarity",
    },
  ],
  buyerFrictions: [],
  winningBuildSpec: {
    coreProblemSolved:
      "Hosts need a professional welcome book that works in their editor of choice, looks fresh in search results, and is ready to publish in under 10 minutes.",
    mustHaveFeatures: [
      "Canva template with shared link",
      "Google Docs version as separate file",
      "Setup guide PDF with step-by-step screenshots",
      "Loom video walkthrough (5-10 min)",
    ],
    mustAvoid: [
      "Generic title reusing top-50 phrasing",
      "Canva-only delivery",
      "Pricing below $12 median without a volume justification",
    ],
  },
  premiumLadder: [
    {
      tier: "good",
      label: "Single Template",
      features: ["Editable Canva template", "PDF export", "Instant download"],
      suggestedPriceRange: "$8–$12",
    },
    {
      tier: "better",
      label: "Dual-Format Pack",
      features: [
        "Canva + Google Docs versions",
        "2 design variants",
        "Setup guide PDF",
      ],
      suggestedPriceRange: "$15–$22",
    },
    {
      tier: "best",
      label: "Complete Host System",
      features: [
        "Canva + Google Docs + Word versions",
        "5 design variants including luxury and pet-friendly",
        "Loom video walkthrough",
        "House rules, check-in guide, local area guide templates",
        "Free lifetime updates",
      ],
      suggestedPriceRange: "$35–$50",
    },
  ],
  listingAngle: {
    headline: "The Airbnb Welcome Book that works in Canva AND Google Docs",
    subheadline: "Two formats, zero friction — set up in under 10 minutes",
    imageCallouts: [
      "Works in Canva + Google Docs — no subscription required",
      "Instant Download with video setup guide",
      "5 niche variants: luxury, pet-friendly, modern, minimal, cabin",
    ],
  },
  riskFlags: [
    {
      flag: "Title sameness score 0.68 — listing may be buried if title follows market template",
      severity: "yellow",
      mitigation:
        "Avoid top repeated bigrams. Lead with format differentiator: 'Canva + Google Docs | Airbnb Welcome Book'.",
    },
    {
      flag: "Top 3 shops hold 42% of results — new entrant needs thumbnail differentiation",
      severity: "yellow",
      mitigation:
        "Design thumbnail with contrasting color palette to the dominant shops (which use white/beige palettes).",
    },
    {
      flag: "Format diversity score: 5 distinct types detected — multi-format is a real opportunity",
      severity: "green",
      mitigation:
        "Lean into format diversity by offering Canva + Google Docs as a named feature, not a footnote.",
    },
  ],
};
