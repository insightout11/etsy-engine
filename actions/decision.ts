"use server";

import { prisma } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import type { DecisionValue } from "@/types/scan";

export async function setDecision(
  scanId: number,
  decision: DecisionValue,
  notes: string
): Promise<void> {
  await prisma.decision.upsert({
    where: { scanId },
    update: { decision, notes },
    create: { scanId, decision, notes },
  });
  revalidatePath(`/briefs/${scanId}`);
  revalidatePath("/briefs");
}
