import type { SignalsResult } from "@/types/signals";
import type { ScanOptions } from "@/types/scan";

export const SYSTEM_PROMPT = `You are a market structure analyst for digital product sellers on Etsy.
Your job is to analyse a structured snapshot of Etsy search results and produce a differentiation brief
to help a seller build a product that outperforms the current market.

RULES (non-negotiable):
1. Every differentiator MUST cite exactly one field from the signals JSON provided.
   Format: supportingSignal = "<topLevel>.<subField>" e.g. "titleSameness.topPhrases"
2. You MUST NOT make any claims about search volume, revenue, sales velocity, or seller income.
   These are unknown to you.
3. You MUST NOT use generic phrases: "unique", "high quality", "stand out", "exceptional",
   "premium experience", "best-in-class", "one-of-a-kind". Be specific.
4. Produce EXACTLY the JSON schema shown. No extra keys, no markdown fences. Raw JSON only.
5. missingFeatures: minimum 3 entries.
6. differentiators: minimum 5 entries. Each must be concrete and cite observable data.
7. premiumLadder: exactly 3 tiers — good, better, best.
8. riskFlags: include at least one green flag (opportunity).
9. buyerFrictions: if reviews are provided in the input, extract real frictions. If not, return [].
10. Base your analysis ONLY on the signals data provided. Do not invent external market facts.`;

export interface BuiltPrompt {
  systemPrompt: string;
  userMessage: string;
}

export function buildPrompt(
  signals: SignalsResult,
  scanId: number,
  options: ScanOptions
): BuiltPrompt {
  const userMessage = `KEYWORD: "${signals.keyword}"
LISTING COUNT: ${signals.listingCount}
SCAN DATE: ${new Date().toISOString()}
REVIEWS ENABLED: ${options.includeReviews}

--- SIGNALS JSON ---
${JSON.stringify(signals, null, 2)}

--- TASK ---
Produce the DifferentiationBrief JSON object. No preamble, no markdown fences. Only raw JSON.

Required schema:
{
  "version": "1.0",
  "scanId": ${scanId},
  "keyword": "${signals.keyword}",
  "generatedAt": "<ISO timestamp>",
  "marketStandard": {
    "summary": "<string, min 20 chars>",
    "typicalFormats": ["<string>"],
    "typicalPriceRange": "<string>"
  },
  "differentiators": [
    {
      "id": "D1",
      "claim": "<specific, actionable, min 20 chars>",
      "supportingSignal": "<topLevel.subField from signals JSON>",
      "evidence": "<exact data point cited, min 10 chars>"
    }
  ],
  "missingFeatures": [
    {
      "feature": "<string>",
      "rationale": "<why it is missing and valuable, min 10 chars>",
      "supportingSignal": "<topLevel.subField from signals JSON>"
    }
  ],
  "buyerFrictions": [
    {
      "friction": "<string>",
      "severity": "high|medium|low",
      "sourceReviews": ["<quoted review text>"]
    }
  ],
  "winningBuildSpec": {
    "coreProblemSolved": "<string>",
    "mustHaveFeatures": ["<string>"],
    "mustAvoid": ["<string>"]
  },
  "premiumLadder": [
    { "tier": "good", "label": "<string>", "features": ["<string>"], "suggestedPriceRange": "<string>" },
    { "tier": "better", "label": "<string>", "features": ["<string>"], "suggestedPriceRange": "<string>" },
    { "tier": "best", "label": "<string>", "features": ["<string>"], "suggestedPriceRange": "<string>" }
  ],
  "listingAngle": {
    "headline": "<string>",
    "subheadline": "<string>",
    "imageCallouts": ["<string>", "<string>", "<string>"]
  },
  "riskFlags": [
    { "flag": "<string>", "severity": "red|yellow|green", "mitigation": "<string>" }
  ]
}`;

  return { systemPrompt: SYSTEM_PROMPT, userMessage };
}
