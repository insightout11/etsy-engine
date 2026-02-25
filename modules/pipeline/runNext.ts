import { prisma } from "@/lib/db/client";
import { startScan } from "@/actions/scan";

export async function runNextPromotedKeyword(): Promise<{ scanId: number } | null> {
  // Find lowest-id promoted candidate (FIFO)
  const candidate = await prisma.keywordCandidate.findFirst({
    where: { status: "promoted" },
    orderBy: { id: "asc" },
  });

  if (!candidate) return null;

  // Mark as scanning (in-progress intermediate state)
  await prisma.keywordCandidate.update({
    where: { id: candidate.id },
    data: { status: "scanning" },
  });

  try {
    const fd = new FormData();
    fd.append("keyword", candidate.keyword);
    fd.append("sampleSize", "20");

    const result = await startScan(fd);

    if (result.error) {
      await prisma.keywordCandidate.update({
        where: { id: candidate.id },
        data: { status: "error" },
      });
      return null;
    }

    await prisma.keywordCandidate.update({
      where: { id: candidate.id },
      data: { status: "scanned" },
    });

    return { scanId: result.scanId };
  } catch {
    await prisma.keywordCandidate.update({
      where: { id: candidate.id },
      data: { status: "error" },
    });
    return null;
  }
}
