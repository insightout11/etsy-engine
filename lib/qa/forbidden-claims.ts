import type { DifferentiationBrief } from "@/types/brief";
import type { QAIssue } from "@/types/qa";

const FORBIDDEN_PATTERNS: RegExp[] = [
  /search\s+volume/i,
  /monthly\s+revenue/i,
  /annual\s+revenue/i,
  /sales\s+velocity/i,
  /\$\d+\s*(?:per\s+month|\/month|pm)/i,
  /\d+\s+sales/i,
  /avg(?:erage)?\s+(?:monthly\s+)?(?:revenue|sales|income)/i,
  /earns?\s+\$\d+/i,
  /makes?\s+\$\d+/i,
  /generates?\s+\$\d+/i,
  /keyword\s+rank/i,
  /seo\s+score/i,
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

export function forbiddenClaimsCheck(brief: DifferentiationBrief): QAIssue[] {
  const issues: QAIssue[] = [];
  const strings = getAllStrings(brief);

  for (const { path, value } of strings) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(value)) {
        issues.push({
          gate: "forbiddenClaim",
          severity: "error",
          message: `Forbidden claim matching /${pattern.source}/ found in brief`,
          location: path,
        });
        break;
      }
    }
  }

  return issues;
}
