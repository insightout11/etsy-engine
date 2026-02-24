import type { EtsyClientInterface, EtsySearchResult, EtsyListing, EtsyImage, EtsyReview } from "@/types/etsy";
import type { EtsyApiSearchResponse, EtsyApiListing, EtsyApiReview } from "./types";

const ETSY_API_BASE = "https://openapi.etsy.com/v3";
const MAX_RETRIES = 3;
const RATE_LIMIT_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normaliseListing(raw: EtsyApiListing): EtsyListing {
  return {
    listing_id: raw.listing_id,
    shop_id: raw.shop_id,
    title: raw.title,
    price: raw.price,
    quantity: raw.quantity ?? 0,
    num_favorers: raw.num_favorers ?? 0,
    creation_tsz: raw.creation_timestamp ?? 0,
    last_modified_tsz: raw.last_modified_timestamp ?? 0,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    state: raw.state === "active" ? "active" : "inactive",
    images: raw.images?.map((img) => ({
      listing_image_id: img.listing_image_id,
      url_fullxfull: img.url_fullxfull,
      url_570xN: img.url_570xN,
      rank: img.rank,
    })),
    url: raw.url,
  };
}

export class RealEtsyClient implements EtsyClientInterface {
  private apiKey: string;
  private accessToken: string;

  constructor(apiKey: string, accessToken: string) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
  }

  private async fetchWithRetry(url: string, attempt = 1): Promise<Response> {
    const response = await fetch(url, {
      headers: {
        "x-api-key": this.apiKey,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 429 && attempt <= MAX_RETRIES) {
      // Rate limited — back off and retry
      const retryAfter = parseInt(response.headers.get("retry-after") ?? "2", 10);
      await sleep(retryAfter * 1000);
      return this.fetchWithRetry(url, attempt + 1);
    }

    if (response.status === 503 && attempt <= MAX_RETRIES) {
      await sleep(RATE_LIMIT_DELAY_MS * attempt);
      return this.fetchWithRetry(url, attempt + 1);
    }

    return response;
  }

  async searchListings(
    keyword: string,
    limit: number,
    offset = 0
  ): Promise<EtsySearchResult> {
    const params = new URLSearchParams({
      keywords: keyword,
      limit: String(Math.min(limit, 100)),
      offset: String(offset),
      sort_on: "score",
      sort_order: "desc",
      includes: "images,tags",
    });

    const url = `${ETSY_API_BASE}/application/listings/active?${params}`;

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Etsy API error ${response.status} for keyword "${keyword}": ${body}`
      );
    }

    const data = (await response.json()) as EtsyApiSearchResponse;

    return {
      count: data.count,
      results: data.results.map(normaliseListing),
      pagination: data.pagination,
    };
  }

  async getListingImages(listingId: number): Promise<EtsyImage[]> {
    const url = `${ETSY_API_BASE}/application/listings/${listingId}/images`;
    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      if (response.status === 404) return [];
      throw new Error(`Etsy images API error ${response.status} for listing ${listingId}`);
    }

    const data = (await response.json()) as { results: EtsyImage[] };
    return data.results ?? [];
  }

  async getReviews(listingId: number, limit = 25): Promise<EtsyReview[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    const url = `${ETSY_API_BASE}/application/listings/${listingId}/reviews?${params}`;

    const response = await this.fetchWithRetry(url);

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) return [];
      throw new Error(`Etsy reviews API error ${response.status} for listing ${listingId}`);
    }

    const data = (await response.json()) as { results: EtsyApiReview[] };
    return (data.results ?? []).map((r) => ({
      listing_id: r.listing_id,
      rating: r.rating,
      review: r.review ?? "",
      create_timestamp: r.create_timestamp,
      language: r.language,
    }));
  }
}
