"use server";

import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { expandSeeds } from "@/modules/keyword-queue/expand-seeds";
import { scoreAllNewCandidates } from "@/modules/keyword-queue/score-all";
import { runNextPromotedKeyword } from "@/modules/pipeline/runNext";
import fs from "fs";
import path from "path";

async function ensureSettings() {
  return prisma.queueSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

export async function expandAndQueue(formData: FormData): Promise<void> {
  const textarea = (formData.get("seeds") as string)?.trim();

  let rawText: string;
  if (textarea) {
    rawText = textarea;
  } else {
    try {
      rawText = fs.readFileSync(path.join(process.cwd(), "seeds.txt"), "utf8");
    } catch {
      rawText = "";
    }
  }

  const seeds = rawText
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));

  if (seeds.length === 0) {
    revalidatePath("/queue");
    return;
  }

  const newKeywords = await expandSeeds(seeds);

  if (newKeywords.length > 0) {
    await prisma.keywordCandidate.createMany({
      data: newKeywords.map((keyword) => ({
        keyword,
        track: "digital",
      })),
    });
  }

  revalidatePath("/queue");
}

export async function scoreAll(): Promise<void> {
  await scoreAllNewCandidates();
  revalidatePath("/queue");
}

export async function promoteCandidate(id: number): Promise<void> {
  await prisma.keywordCandidate.updateMany({
    where: { id, status: { in: ["new", "scored"] } },
    data: { status: "promoted" },
  });
  revalidatePath("/queue");
}

export async function rejectCandidate(id: number): Promise<void> {
  await prisma.keywordCandidate.updateMany({
    where: { id, status: { notIn: ["scanned", "scanning"] } },
    data: { status: "rejected" },
  });
  revalidatePath("/queue");
}

export async function toggleAutoBatch(): Promise<void> {
  const settings = await ensureSettings();
  await prisma.queueSettings.update({
    where: { id: 1 },
    data: { autoBatch: !settings.autoBatch },
  });
  revalidatePath("/queue");
}

export async function pauseQueue(): Promise<void> {
  await ensureSettings();
  await prisma.queueSettings.update({
    where: { id: 1 },
    data: { paused: true },
  });
  revalidatePath("/queue");
}

export async function resumeQueue(): Promise<void> {
  await ensureSettings();
  await prisma.queueSettings.update({
    where: { id: 1 },
    data: { paused: false },
  });
  revalidatePath("/queue");
}

export async function runNextManual(): Promise<void> {
  await runNextPromotedKeyword();
  revalidatePath("/queue");
  revalidatePath("/briefs");
}
