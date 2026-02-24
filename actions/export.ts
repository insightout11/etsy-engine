"use server";

import { prisma } from "@/lib/db/client";
import { briefToMarkdown } from "@/lib/export/to-markdown";
import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";

export async function exportBriefMarkdown(
  scanId: number
): Promise<{ markdown: string; filename: string }> {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: { brief: true, signals: true },
  });

  if (!scan?.brief || !scan?.signals) {
    throw new Error(`No brief found for scan ${scanId}`);
  }

  const brief = JSON.parse(scan.brief.briefJson) as DifferentiationBrief;
  const signals = JSON.parse(scan.signals.signalsJson) as SignalsResult;

  const markdown = briefToMarkdown(brief, signals, scan.keyword, scanId);

  const date = new Date().toISOString().split("T")[0];
  const slug = scan.keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
  const filename = `brief-${slug}-${date}.md`;

  return { markdown, filename };
}
