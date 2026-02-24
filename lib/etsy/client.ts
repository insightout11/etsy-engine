import type { EtsyClientInterface } from "@/types/etsy";
import { RealEtsyClient } from "./real-client";

export function getEtsyClient(): EtsyClientInterface {
  const apiKey = process.env.ETSY_API_KEY;
  const accessToken = process.env.ETSY_ACCESS_TOKEN;

  if (!apiKey || !accessToken) {
    throw new Error(
      "Missing Etsy API credentials. Set ETSY_API_KEY and ETSY_ACCESS_TOKEN in .env.local.\n" +
      "See README.md → 'Etsy OAuth2 Setup' for step-by-step instructions."
    );
  }

  return new RealEtsyClient(apiKey, accessToken);
}
