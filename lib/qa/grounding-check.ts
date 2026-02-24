import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";
import type { QAIssue } from "@/types/qa";

/**
 * Check that each differentiator's supportingSignal resolves to a real field
 * in the SignalsResult object.
 */
export function groundingCheck(
  brief: DifferentiationBrief,
  signals: SignalsResult
): QAIssue[] {
  const issues: QAIssue[] = [];

  for (const diff of brief.differentiators) {
    const parts = diff.supportingSignal.split(".");
    if (parts.length < 2) {
      issues.push({
        gate: "grounding",
        severity: "warning",
        message: `Differentiator ${diff.id}: supportingSignal "${diff.supportingSignal}" is not in "topLevel.subField" format`,
        location: `differentiators.${diff.id}`,
      });
      continue;
    }

    const [topLevel, subField] = parts;
    const topObj = (signals as unknown as Record<string, unknown>)[topLevel];

    if (topObj === undefined || topObj === null) {
      issues.push({
        gate: "grounding",
        severity: "warning",
        message: `Differentiator ${diff.id}: top-level field "${topLevel}" does not exist in signals`,
        location: `differentiators.${diff.id}`,
      });
      continue;
    }

    const subVal = (topObj as Record<string, unknown>)[subField];
    if (subVal === undefined || subVal === null) {
      issues.push({
        gate: "grounding",
        severity: "warning",
        message: `Differentiator ${diff.id}: sub-field "${subField}" not found in signals.${topLevel}`,
        location: `differentiators.${diff.id}`,
      });
    }
  }

  return issues;
}
