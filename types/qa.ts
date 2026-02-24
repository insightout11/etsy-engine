export type QAGateName =
  | "genericPhrase"
  | "specificity"
  | "forbiddenClaim"
  | "grounding";

export interface QAIssue {
  gate: QAGateName;
  severity: "error" | "warning";
  message: string;
  location?: string;
}

export interface QAResult {
  passed: boolean;
  issues: QAIssue[];
  checkedAt: string;
  attemptNumber: number;
}
