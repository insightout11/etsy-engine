import { prisma } from "@/lib/db/client";
import { z } from "zod";

const TOTAL_CAP = 400;

function normalize(kw: string): string {
  return kw.toLowerCase().trim().replace(/\s+/g, " ");
}

function expandMock(seed: string): string[] {
  const kw = normalize(seed);
  return [
    kw,
    `${kw} printable`,
    `printable ${kw}`,
    `${kw} template`,
    `${kw} instant download`,
    `digital ${kw}`,
    `${kw} pdf`,
    `${kw} svg`,
    `${kw} editable`,
    `canva ${kw}`,
    `${kw} planner`,
    `${kw} tracker`,
    `${kw} journal`,
    `${kw} checklist`,
    `${kw} bundle`,
    `${kw} pack`,
    `${kw} kit`,
    `${kw} set`,
    `${kw} worksheet`,
    `digital download ${kw}`,
  ];
}

async function expandGemini(seed: string): Promise<string[]> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt =
    `Generate exactly 20 Etsy keyword variations for the seed keyword: "${seed}".\n` +
    `Return ONLY a valid JSON array of 20 strings. No explanation, no markdown, just the JSON array.\n` +
    `Example format: ["keyword 1", "keyword 2", ...]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown code blocks if present
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return z.array(z.string()).length(20).parse(JSON.parse(cleaned));
}

export async function expandSeeds(seeds: string[]): Promise<string[]> {
  if (seeds.length === 0) return [];

  const provider = process.env.LLM_PROVIDER ?? "mock";

  // Generate variants for each seed
  const expanded: string[] = [];
  for (const seed of seeds) {
    const normalizedSeed = normalize(seed);
    if (!normalizedSeed) continue;

    const variants =
      provider === "gemini"
        ? await expandGemini(normalizedSeed)
        : expandMock(normalizedSeed);

    expanded.push(...variants);
  }

  // Normalize all variants
  const normalized = expanded.map(normalize);

  // Deduplicate within batch
  const deduped = Array.from(new Set(normalized));

  // Filter out keywords already in DB
  const existing = await prisma.keywordCandidate.findMany({
    where: { keyword: { in: deduped } },
    select: { keyword: true },
  });
  const existingSet = new Set(existing.map((e) => e.keyword));
  const fresh = deduped.filter((kw) => !existingSet.has(kw));

  // Enforce 400 cap
  return fresh.slice(0, TOTAL_CAP);
}
