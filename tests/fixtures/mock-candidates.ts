/**
 * 20 deterministic fake KeywordCandidate objects for use in unit tests.
 * NOT used in production code — tests only.
 */

export interface MockCandidate {
  id: number;
  keyword: string;
  seed: string | null;
  track: string;
  status: string;
  score: number | null;
  scoreJson: string | null;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const BASE_DATE = new Date("2026-02-25T00:00:00Z");

const SEEDS = [
  "wedding planner",
  "budget tracker",
  "meal planner",
  "habit tracker",
  "invoice template",
];

const KEYWORDS = [
  "wedding planner printable",
  "wedding planner template",
  "printable wedding planner",
  "budget tracker template",
  "budget tracker printable",
  "digital budget tracker",
  "meal planner template",
  "meal planner printable",
  "printable meal planner",
  "habit tracker template",
  "habit tracker printable",
  "digital habit tracker",
  "invoice template printable",
  "invoice template editable",
  "canva invoice template",
  "wedding planner pdf",
  "budget tracker pdf",
  "meal planner pdf",
  "habit tracker pdf",
  "invoice template pdf",
];

export const MOCK_CANDIDATES: MockCandidate[] = KEYWORDS.map((keyword, i) => ({
  id: i + 1,
  keyword,
  seed: SEEDS[Math.floor(i / 4)] ?? null,
  track: "digital",
  status: i < 10 ? "new" : i < 15 ? "scored" : i < 18 ? "promoted" : "rejected",
  score: i < 10 ? null : Math.round(40 + i * 2),
  scoreJson: null,
  notes: "",
  createdAt: BASE_DATE,
  updatedAt: BASE_DATE,
}));
