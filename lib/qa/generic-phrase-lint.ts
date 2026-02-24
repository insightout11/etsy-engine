import type { DifferentiationBrief } from "@/types/brief";
import type { QAIssue } from "@/types/qa";

const FORBIDDEN_PHRASES = [
  "unique",
  "high quality",
  "high-quality",
  "stand out",
  "stand-out",
  "exceptional",
  "premium experience",
  "best-in-class",
  "best in class",
  "one-of-a-kind",
  "one of a kind",
  "unparalleled",
  "world-class",
  "top-notch",
  "top notch",
  "amazing",
  "incredible",
  "outstanding",
  "superior quality",
];

function getAllStrings(obj: unknown, path = ""): Array<{ path: string; value: string }> {
  if (typeof obj === "string") {
    return [{ path, value: obj }];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, i) => getAllStrings(item, `${path}[${i}]`));
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([key, val]) =>
      getAllStrings(val, path ? `${path}.${key}` : key)
    );
  }
  return [];
}

export function genericPhraseLint(brief: DifferentiationBrief): QAIssue[] {
  const issues: QAIssue[] = [];
  const strings = getAllStrings(brief);

  for (const { path, value } of strings) {
    const lower = value.toLowerCase();
    for (const phrase of FORBIDDEN_PHRASES) {
      if (lower.includes(phrase)) {
        issues.push({
          gate: "genericPhrase",
          severity: "error",
          message: `Generic phrase "${phrase}" found in brief`,
          location: path,
        });
        break; // one issue per string field
      }
    }
  }

  return issues;
}
