import { prisma } from "@/lib/db/client";
import { getEtsyClient } from "@/lib/etsy/client";
import { computeSignals } from "@/lib/signals/index";
import { getLLMClient } from "@/lib/llm/client";
import { runQAGates } from "@/lib/qa/gates";
import { getCachedListing, upsertListing, listingToEtsyListing } from "./cache";
import { emitProgress, type ProgressEmitter } from "./progress-emitter";
import type { ScanOptions } from "@/types/scan";
import type { EtsyListing } from "@/types/etsy";

const MAX_REVIEW_LISTINGS = 10; // Only fetch reviews for top N listings
const MAX_REVIEWS_PER_LISTING = 10;
const MAX_LLM_ATTEMPTS = 2;

export async function runScan(
  scanId: number,
  keyword: string,
  options: ScanOptions
): Promise<void> {
  const emit = emitProgress(scanId);

  try {
    // ── Phase 1: Fetching ───────────────────────────────────────────────────
    await updateStatus(scanId, "fetching");
    emit({ phase: "fetching", message: "Connecting to Etsy API...", progress: 0 });

    const etsyClient = getEtsyClient();
    let fetchedListings: EtsyListing[] = [];
    const warnings: string[] = [];

    // Fetch search results
    const searchResult = await etsyClient.searchListings(keyword, options.sampleSize);
    const rawListings = searchResult.results;

    if (rawListings.length === 0) {
      warnings.push(`No listings found for "${keyword}". Try a broader keyword.`);
      emit({ phase: "fetching", message: "No listings found", progress: 100, warnings });
    } else if (rawListings.length < options.sampleSize * 0.5) {
      warnings.push(
        `Only ${rawListings.length} listings returned (requested ${options.sampleSize}). Signal quality may be lower.`
      );
    }

    // Cache + upsert each listing
    const listingDbIds: number[] = [];
    for (let i = 0; i < rawListings.length; i++) {
      const raw = rawListings[i];
      const etsyListingId = String(raw.listing_id);

      let dbListing = await getCachedListing(etsyListingId, options.forceRefresh);
      if (!dbListing) {
        dbListing = await upsertListing(raw, i);
      }
      listingDbIds.push(dbListing.id);
      fetchedListings.push(listingToEtsyListing(dbListing));

      emit({
        phase: "fetching",
        message: `Fetched ${i + 1}/${rawListings.length} listings...`,
        progress: Math.round(((i + 1) / rawListings.length) * 80),
        listingCount: i + 1,
      });
    }

    // Insert scan_listings join rows
    await prisma.$transaction(
      listingDbIds.map((listingId, idx) =>
        prisma.scanListing.upsert({
          where: { scanId_listingId: { scanId, listingId } },
          update: { rankIndex: idx },
          create: { scanId, listingId, rankIndex: idx },
        })
      )
    );

    // Reviews (optional, off by default, top 10 listings only)
    if (options.includeReviews && fetchedListings.length > 0) {
      emit({ phase: "fetching", message: "Fetching reviews for top listings...", progress: 85 });
      const reviewListings = fetchedListings.slice(0, MAX_REVIEW_LISTINGS);

      const reviewsByListing: Record<number, string[]> = {};
      let reviewsFailed = false;

      for (const listing of reviewListings) {
        try {
          const reviews = await etsyClient.getReviews(
            listing.listing_id,
            MAX_REVIEWS_PER_LISTING
          );
          if (reviews.length > 0) {
            reviewsByListing[listing.listing_id] = reviews.map((r) => r.review);
          }
        } catch {
          reviewsFailed = true;
        }
      }

      if (reviewsFailed) {
        warnings.push(
          "Review fetching unavailable for some listings. Buyer Frictions section will have limited data."
        );
      }

      // Attach reviews to listings for LLM context by augmenting rawJson
      // Store review text in a side-channel for the prompt builder
      (global as Record<string, unknown>)[`reviews_${scanId}`] = reviewsByListing;
    }

    emit({ phase: "fetching", message: "All listings cached", progress: 100, listingCount: fetchedListings.length });

    // ── Phase 2: Analyzing ─────────────────────────────────────────────────
    await updateStatus(scanId, "analyzing");
    emit({ phase: "analyzing", message: "Computing market signals...", progress: 0 });

    const signals = await computeSignals(fetchedListings, keyword);

    await prisma.signal.upsert({
      where: { scanId },
      update: { signalsJson: JSON.stringify(signals) },
      create: { scanId, signalsJson: JSON.stringify(signals) },
    });

    emit({ phase: "analyzing", message: "Signals computed", progress: 100 });

    // ── Phase 3: Drafting Brief ───────────────────────────────────────────
    await updateStatus(scanId, "drafting");
    emit({ phase: "drafting", message: "Generating Differentiation Brief...", progress: 0 });

    const llmClient = getLLMClient();
    let brief = await llmClient.generateBrief(signals, scanId, options);

    emit({ phase: "drafting", message: "Brief generated, running quality checks...", progress: 50 });

    let qaResult = runQAGates(brief, signals, 1);

    // Auto-regenerate once on QA failure
    if (!qaResult.passed) {
      emit({
        phase: "drafting",
        message: `QA check failed (${qaResult.issues.filter((i) => i.severity === "error").length} errors). Regenerating...`,
        progress: 60,
        warnings: qaResult.issues.map((i) => i.message),
      });

      if (MAX_LLM_ATTEMPTS > 1) {
        try {
          brief = await llmClient.generateBrief(signals, scanId, options);
          qaResult = runQAGates(brief, signals, 2);
        } catch (e) {
          warnings.push(`Brief regeneration failed: ${(e as Error).message}`);
        }
      }
    }

    const finalStatus = qaResult.passed ? "complete" : "needs_review";

    await prisma.brief.upsert({
      where: { scanId },
      update: {
        briefJson: JSON.stringify(brief),
        qaJson: JSON.stringify(qaResult),
        attemptCount: qaResult.attemptNumber,
      },
      create: {
        scanId,
        briefJson: JSON.stringify(brief),
        qaJson: JSON.stringify(qaResult),
        attemptCount: qaResult.attemptNumber,
      },
    });

    await updateStatus(scanId, finalStatus, undefined);

    emit({
      phase: finalStatus,
      message: finalStatus === "complete" ? "Brief ready" : "Brief needs review — QA issues found",
      progress: 100,
      warnings: [
        ...warnings,
        ...(finalStatus === "needs_review"
          ? qaResult.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.message}`)
          : []),
      ],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error during scan";
    await updateStatus(scanId, "error", message);
    emit({ phase: "error", message, progress: 0 });
  }
}

async function updateStatus(
  scanId: number,
  status: string,
  errorMessage?: string
) {
  await prisma.scan.update({
    where: { id: scanId },
    data: { status, errorMessage: errorMessage ?? null },
  });
}
