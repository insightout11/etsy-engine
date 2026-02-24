import { describe, it, expect } from "vitest";
import { runQAGates } from "@/lib/qa/gates";
import { VALID_MOCK_BRIEF } from "@/tests/fixtures/mock-brief";
import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";

// Minimal signals for grounding checks
const MOCK_SIGNALS: SignalsResult = {
  priceBands: {
    min: 5, max: 50, median: 11.99, p25: 8.24, p75: 17.49, mean: 13.5,
    modeBucket: "$10–$15", buckets: [],
  },
  titleSameness: {
    averageSimilarity: 0.68,
    topPhrases: [{ phrase: "airbnb welcome", count: 41, score: 0.9 }],
    clusterCount: 12,
  },
  dominance: {
    topShops: [{ shopId: "1001", listingCount: 9, sharePercent: 18 }],
    top3SharePercent: 42,
    isConcentrated: true,
  },
  formatSignals: {
    editable: 28, canva: 41, googleSheets: 3, notion: 4, pdf: 32,
    bundleKitSystem: 6, instantDownload: 18, distinctTypeCount: 7,
  },
  bundleDepth: { avgIncludesCount: 5.2, maxIncludesCount: 12, examples: ["includes 5 templates"] },
  listingCount: 50,
  keyword: "airbnb welcome book template",
  computedAt: new Date().toISOString(),
};

function cloneBrief(): DifferentiationBrief {
  return JSON.parse(JSON.stringify(VALID_MOCK_BRIEF)) as DifferentiationBrief;
}

describe("qa-gates", () => {
  it("valid brief passes all gates", () => {
    const result = runQAGates(VALID_MOCK_BRIEF, MOCK_SIGNALS);
    expect(result.passed).toBe(true);
    const errors = result.issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("genericPhraseLint fires when 'high quality' is in brief", () => {
    const brief = cloneBrief();
    brief.marketStandard.summary =
      "This is a high quality market with many options.";
    const result = runQAGates(brief, MOCK_SIGNALS);
    expect(result.passed).toBe(false);
    const genericIssues = result.issues.filter((i) => i.gate === "genericPhrase");
    expect(genericIssues.length).toBeGreaterThan(0);
  });

  it("genericPhraseLint fires when 'unique' appears in a differentiator claim", () => {
    const brief = cloneBrief();
    brief.differentiators[0].claim =
      "This is a unique approach that no one else is offering in the market right now.";
    const result = runQAGates(brief, MOCK_SIGNALS);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.gate === "genericPhrase")).toBe(true);
  });

  it("specificityCheck fires when differentiators count is below 5", () => {
    const brief = cloneBrief();
    brief.differentiators = brief.differentiators.slice(0, 3);
    const result = runQAGates(brief, MOCK_SIGNALS);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.gate === "specificity")).toBe(true);
  });

  it("specificityCheck fires when missingFeatures count is below 3", () => {
    const brief = cloneBrief();
    brief.missingFeatures = brief.missingFeatures.slice(0, 1);
    const result = runQAGates(brief, MOCK_SIGNALS);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.gate === "specificity")).toBe(true);
  });

  it("forbiddenClaims fires when 'search volume' is mentioned", () => {
    const brief = cloneBrief();
    brief.differentiators[0].claim =
      "Based on search volume data, this keyword gets 10,000 monthly searches which indicates high demand.";
    const result = runQAGates(brief, MOCK_SIGNALS);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.gate === "forbiddenClaim")).toBe(true);
  });

  it("forbiddenClaims fires when 'sales velocity' is mentioned", () => {
    const brief = cloneBrief();
    brief.winningBuildSpec.coreProblemSolved =
      "High sales velocity in this niche suggests demand for quality solutions.";
    const result = runQAGates(brief, MOCK_SIGNALS);
    expect(result.passed).toBe(false);
    expect(result.issues.some((i) => i.gate === "forbiddenClaim")).toBe(true);
  });

  it("groundingCheck fires when supportingSignal doesn't map to a real field", () => {
    const brief = cloneBrief();
    brief.differentiators[0].supportingSignal = "nonExistentField.subField";
    const result = runQAGates(brief, MOCK_SIGNALS);
    const groundingIssues = result.issues.filter((i) => i.gate === "grounding");
    expect(groundingIssues.length).toBeGreaterThan(0);
    // Grounding check is warning severity, so brief may still pass
    expect(groundingIssues[0].severity).toBe("warning");
  });

  it("QAResult.passed is false when any error-severity issue exists", () => {
    const brief = cloneBrief();
    // Trigger two errors: specificity + forbidden claim
    brief.differentiators = brief.differentiators.slice(0, 2);
    brief.marketStandard.summary = "High sales velocity in this market.";
    const result = runQAGates(brief, MOCK_SIGNALS);
    expect(result.passed).toBe(false);
    expect(result.issues.filter((i) => i.severity === "error").length).toBeGreaterThan(0);
  });
});
