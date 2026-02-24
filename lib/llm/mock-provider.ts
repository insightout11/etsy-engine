import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class MockLLMProvider {
  async generateBrief(
    signals: SignalsResult,
    scanId: number
  ): Promise<DifferentiationBrief> {
    await sleep(800); // realistic delay

    const kw = signals.keyword;
    const median = signals.priceBands.median;
    const topPhrases = signals.titleSameness.topPhrases.slice(0, 3);
    const topPhrasesText =
      topPhrases.length > 0
        ? topPhrases.map((p) => `"${p.phrase}"`).join(", ")
        : "common keyword phrases";
    const formatPdf = signals.formatSignals.pdf;
    const formatCanva = signals.formatSignals.canva;
    const top3Share = signals.dominance.top3SharePercent;

    return {
      version: "1.0",
      scanId,
      keyword: kw,
      generatedAt: new Date().toISOString(),
      marketStandard: {
        summary: `The "${kw}" market shows ${signals.listingCount} active listings with a median price of $${median}. The market is dominated by PDF and Canva-based templates with highly similar titles, indicating low differentiation among most sellers.`,
        typicalFormats: ["PDF", "Canva Template", "Instant Download"],
        typicalPriceRange: `$${signals.priceBands.p25}–$${signals.priceBands.p75}`,
      },
      differentiators: [
        {
          id: "D1",
          claim: `${Math.round(formatCanva / signals.listingCount * 100)}% of listings use Canva only — offering a Google Docs or Notion version captures buyers who don't have Canva Pro.`,
          supportingSignal: "formatSignals.canva",
          evidence: `${formatCanva} of ${signals.listingCount} listings are Canva-based (${Math.round(formatCanva / signals.listingCount * 100)}%); Google Sheets count is ${signals.formatSignals.googleSheets}.`,
        },
        {
          id: "D2",
          claim: `Top ${top3Share}% of listings are controlled by 3 shops — a fresh shop with a new visual identity has clear shelf space.`,
          supportingSignal: "dominance.top3SharePercent",
          evidence: `Top 3 shops hold ${top3Share}% of top ${signals.listingCount} results.`,
        },
        {
          id: "D3",
          claim: `Title sameness score is ${signals.titleSameness.averageSimilarity} — repeated phrases ${topPhrasesText} appear in most titles, meaning a distinctly framed listing title stands out.`,
          supportingSignal: "titleSameness.averageSimilarity",
          evidence: `Average cosine similarity across titles is ${signals.titleSameness.averageSimilarity}; top phrase count indicates saturation.`,
        },
        {
          id: "D4",
          claim: `Price band p25–p75 is $${signals.priceBands.p25}–$${signals.priceBands.p75} — a premium bundle priced above p75 is underrepresented and signals authority.`,
          supportingSignal: "priceBands.p75",
          evidence: `75th percentile is $${signals.priceBands.p75}; only ${signals.formatSignals.bundleKitSystem} listings use bundle positioning.`,
        },
        {
          id: "D5",
          claim: `Only ${signals.formatSignals.instantDownload} listings explicitly label "Instant Download" in titles despite offering it — adding this prominently reduces buyer hesitation.`,
          supportingSignal: "formatSignals.instantDownload",
          evidence: `${signals.formatSignals.instantDownload} of ${signals.listingCount} listings use "Instant Download" in title/tags.`,
        },
      ],
      missingFeatures: [
        {
          feature: "Editable version in a non-Canva format (Google Docs, Word, or Notion)",
          rationale: `With ${formatCanva} Canva listings, buyers without Canva Pro are underserved. A Google Docs version costs no extra effort to produce.`,
          supportingSignal: "formatSignals.googleSheets",
        },
        {
          feature: "Video walkthrough or setup guide included",
          rationale: `No listings in the observed ${signals.listingCount} signal a tutorial video. This reduces friction for first-time buyers and justifies a price premium.`,
          supportingSignal: "titleSameness.topPhrases",
        },
        {
          feature: "Seasonal or niche-specific variants (e.g., luxury cabin, urban apartment)",
          rationale: `Top phrases show generic positioning. A niche variant (e.g., mountain cabin, pet-friendly) is absent from the ${signals.listingCount} observed titles.`,
          supportingSignal: "titleSameness.topPhrases",
        },
      ],
      buyerFrictions: [],
      winningBuildSpec: {
        coreProblemSolved: `Buyers need a professional-looking ${kw} that works in multiple editors, looks fresh, and installs in under 5 minutes.`,
        mustHaveFeatures: [
          "Available in Canva AND Google Docs (two separate files)",
          "Instant download with setup instructions PDF",
          "At least one niche-specific variant (e.g., luxury, pet-friendly)",
          "Video tutorial link included in delivery",
        ],
        mustAvoid: [
          "Generic title mimicking top sellers",
          "Single-format delivery (Canva only)",
          "Pricing below median without a clear reason",
        ],
      },
      premiumLadder: [
        {
          tier: "good",
          label: "Single Template",
          features: [
            "One editable Canva template",
            "PDF export included",
            "Instant download",
          ],
          suggestedPriceRange: `$${Math.round(signals.priceBands.p25)}–$${Math.round(signals.priceBands.median)}`,
        },
        {
          tier: "better",
          label: "Dual-Format Pack",
          features: [
            "Canva + Google Docs versions",
            "Two design variants",
            "Setup guide PDF",
            "Instant download",
          ],
          suggestedPriceRange: `$${Math.round(signals.priceBands.median)}–$${Math.round(signals.priceBands.p75)}`,
        },
        {
          tier: "best",
          label: "Complete Host System",
          features: [
            "Canva + Google Docs + Notion versions",
            "5+ design variants including niche styles",
            "Video walkthrough (Loom)",
            "House rules, check-in guide, local guide templates",
            "Lifetime updates",
          ],
          suggestedPriceRange: `$${Math.round(signals.priceBands.p75)}–$${Math.round(signals.priceBands.max)}`,
        },
      ],
      listingAngle: {
        headline: `The ${kw} that works in Canva AND Google Docs`,
        subheadline: "Two formats, zero friction — set up in under 5 minutes",
        imageCallouts: [
          "Works in Canva + Google Docs",
          "Instant Download | Setup Guide Included",
          "Editable in any device, no subscription needed",
          "5-minute setup with video walkthrough",
        ],
      },
      riskFlags: [
        {
          flag: `High title sameness (${signals.titleSameness.averageSimilarity}) — listing may be buried if title is generic`,
          severity: signals.titleSameness.averageSimilarity > 0.7 ? "red" : "yellow",
          mitigation: "Use a distinctive title framing that avoids the top repeated phrases.",
        },
        {
          flag: `Top 3 shops hold ${top3Share}% of results — new entrant needs strong visual differentiation`,
          severity: top3Share > 50 ? "red" : top3Share > 30 ? "yellow" : "green",
          mitigation: "Invest in thumbnail design that visually differs from the dominant shops.",
        },
        {
          flag: `Format diversity: ${signals.formatSignals.distinctTypeCount} distinct types found — multi-format listing is an opportunity`,
          severity: "green",
          mitigation: "Offer at least 2 format types (e.g., Canva + Google Docs) to capture wider audience.",
        },
      ],
    };
  }
}
