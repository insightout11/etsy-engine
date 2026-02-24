"use server";

import { prisma } from "@/lib/db/client";
import { runScan } from "@/lib/pipeline/scan-orchestrator";
import type { ScanOptions } from "@/types/scan";

export interface StartScanResult {
  scanId: number;
  error?: string;
}

export async function startScan(formData: FormData): Promise<StartScanResult> {
  const keyword = (formData.get("keyword") as string)?.trim();

  if (!keyword || keyword.length < 2) {
    return { scanId: 0, error: "Keyword must be at least 2 characters." };
  }

  const rawN = formData.get("sampleSize");
  const sampleSizeRaw = rawN ? parseInt(String(rawN), 10) : 50;
  const sampleSize = ([20, 50, 100].includes(sampleSizeRaw)
    ? sampleSizeRaw
    : 50) as 20 | 50 | 100;

  const options: ScanOptions = {
    sampleSize,
    includeReviews: formData.get("includeReviews") === "on",
    detailDepth: (formData.get("detailDepth") as "standard" | "deep") ?? "standard",
    region: (formData.get("region") as string) || undefined,
    language: (formData.get("language") as string) || undefined,
    forceRefresh: formData.get("forceRefresh") === "on",
  };

  let scan;
  try {
    scan = await prisma.scan.create({
      data: {
        keyword,
        optionsJson: JSON.stringify(options),
        status: "queued",
      },
    });
  } catch (e) {
    return { scanId: 0, error: `Failed to create scan: ${(e as Error).message}` };
  }

  // Fire-and-forget — client listens via SSE
  void runScan(scan.id, keyword, options);

  return { scanId: scan.id };
}
