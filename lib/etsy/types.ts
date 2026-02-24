// Re-export types from the shared types module for convenience
export type { EtsyListing, EtsyImage, EtsyPrice, EtsyReview, EtsySearchResult, EtsyClientInterface } from "@/types/etsy";

// Raw API shapes that may differ from our normalised types
export interface EtsyApiListing {
  listing_id: number;
  shop_id: number;
  title: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  quantity: number;
  num_favorers: number;
  creation_timestamp: number; // v3 uses _timestamp not _tsz
  last_modified_timestamp: number;
  tags: string[];
  state: string;
  images?: Array<{
    listing_image_id: number;
    url_fullxfull: string;
    url_570xN: string;
    rank: number;
  }>;
  url?: string;
}

export interface EtsyApiSearchResponse {
  count: number;
  results: EtsyApiListing[];
  pagination?: {
    effective_limit: number;
    effective_offset: number;
    next_offset: number | null;
    effective_page: number;
  };
}

export interface EtsyApiReview {
  listing_id: number;
  rating: number;
  review: string;
  create_timestamp: number;
  language?: string;
}
