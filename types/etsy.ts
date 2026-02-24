export interface EtsyPrice {
  amount: number;
  divisor: number;
  currency_code: string;
}

export interface EtsyImage {
  listing_image_id: number;
  url_fullxfull: string;
  url_570xN: string;
  rank: number;
}

export interface EtsyListing {
  listing_id: number;
  shop_id: number;
  title: string;
  price: EtsyPrice;
  quantity: number;
  num_favorers: number;
  creation_tsz: number;
  last_modified_tsz: number;
  tags: string[];
  state: "active" | "inactive" | "removed";
  images?: EtsyImage[];
  url?: string;
  description?: string;
}

export interface EtsyReview {
  listing_id: number;
  rating: number;
  review: string;
  create_timestamp: number;
  language?: string;
}

export interface EtsySearchResult {
  count: number;
  results: EtsyListing[];
  pagination?: {
    effective_limit: number;
    effective_offset: number;
    next_offset: number | null;
    effective_page: number;
  };
}

export interface EtsyClientInterface {
  searchListings(
    keyword: string,
    limit: number,
    offset?: number
  ): Promise<EtsySearchResult>;
  getListingImages(listingId: number): Promise<EtsyImage[]>;
  getReviews(listingId: number, limit?: number): Promise<EtsyReview[]>;
}
