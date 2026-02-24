import type { DifferentiationBrief } from "@/types/brief";
import type { QAIssue } from "@/types/qa";

const MIN_DIFFERENTIATORS = 5;
const MIN_MISSING_FEATURES = 3;

export function specificityCheck(brief: DifferentiationBrief): QAIssue[] {
  const issues: QAIssue[] = [];

  if (brief.differentiators.length < MIN_DIFFERENTIATORS) {
    issues.push({
      gate: "specificity",
      severity: "error",
      message: `Only ${brief.differentiators.length} differentiators provided; minimum is ${MIN_DIFFERENTIATORS}`,
      location: "differentiators",
    });
  }

  if (brief.missingFeatures.length < MIN_MISSING_FEATURES) {
    issues.push({
      gate: "specificity",
      severity: "error",
      message: `Only ${brief.missingFeatures.length} missing features provided; minimum is ${MIN_MISSING_FEATURES}`,
      location: "missingFeatures",
    });
  }

  return issues;
}
