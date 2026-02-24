import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";
import type { QAResult } from "@/types/qa";
import { genericPhraseLint } from "./generic-phrase-lint";
import { specificityCheck } from "./specificity-check";
import { forbiddenClaimsCheck } from "./forbidden-claims";
import { groundingCheck } from "./grounding-check";

export function runQAGates(
  brief: DifferentiationBrief,
  signals: SignalsResult,
  attemptNumber = 1
): QAResult {
  const issues = [
    ...genericPhraseLint(brief),
    ...specificityCheck(brief),
    ...forbiddenClaimsCheck(brief),
    ...groundingCheck(brief, signals),
  ];

  const hasErrors = issues.some((i) => i.severity === "error");

  return {
    passed: !hasErrors,
    issues,
    checkedAt: new Date().toISOString(),
    attemptNumber,
  };
}
