import { prisma } from "@/lib/db/client";
import { scoreCandidate } from "./score-candidate";

export async function scoreAllNewCandidates(): Promise<void> {
  const candidates = await prisma.keywordCandidate.findMany({
    where: { status: "new" },
    select: { id: true, keyword: true },
  });

  for (const candidate of candidates) {
    try {
      const scoreData = await scoreCandidate(candidate.keyword);
      await prisma.keywordCandidate.update({
        where: { id: candidate.id },
        data: {
          score: scoreData.composite,
          scoreJson: JSON.stringify(scoreData),
          status: "scored",
        },
      });
    } catch {
      await prisma.keywordCandidate.update({
        where: { id: candidate.id },
        data: { status: "error" },
      });
    }
  }
}
