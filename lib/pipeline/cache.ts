import { prisma } from "@/lib/db/client";
import type { EtsyListing } from "@/types/etsy";
import type { Listing } from "@prisma/client";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedListing(
  etsyListingId: string,
  forceRefresh = false
): Promise<Listing | null> {
  if (forceRefresh) return null;

  const listing = await prisma.listing.findUnique({
    where: { etsyListingId },
  });

  if (!listing) return null;

  const ageMs = Date.now() - listing.fetchedAt.getTime();
  if (ageMs > CACHE_TTL_MS) return null; // stale

  return listing;
}

export async function upsertListing(
  raw: EtsyListing,
  rankIndex: number
): Promise<Listing> {
  const priceAmount = raw.price.amount / raw.price.divisor;
  const currency = raw.price.currency_code;
  const etsyListingId = String(raw.listing_id);

  return prisma.listing.upsert({
    where: { etsyListingId },
    update: {
      title: raw.title,
      priceAmount,
      currency,
      quantity: raw.quantity,
      numFavorers: raw.num_favorers,
      tags: JSON.stringify(raw.tags),
      rawJson: JSON.stringify(raw),
      fetchedAt: new Date(),
    },
    create: {
      etsyListingId,
      shopId: String(raw.shop_id),
      title: raw.title,
      priceAmount,
      currency,
      quantity: raw.quantity,
      numFavorers: raw.num_favorers,
      tags: JSON.stringify(raw.tags),
      rawJson: JSON.stringify(raw),
    },
  });
}

export function listingToEtsyListing(listing: Listing): EtsyListing {
  const raw = JSON.parse(listing.rawJson) as EtsyListing;
  return raw;
}
