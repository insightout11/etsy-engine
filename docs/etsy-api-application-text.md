# Etsy API key application — paste-ready text

## App name
Etsy Engine

## Public URL
(Use your Vercel deployment URL, e.g. https://<project>.vercel.app/etsy-engine)

## App description (long)
Etsy Engine is an in-development product research and listing-brief tool for Etsy sellers.

Planned workflow:
1) Keyword Queue: Sellers enter seed keywords, the app expands and scores keyword candidates, and the seller approves keywords into a queue.
2) Market Scan: For queued keywords, the app uses the Etsy Open API to fetch permitted marketplace/search/listing signals and summarizes competition and differentiation signals.
3) Brief Generator: The app generates a structured brief (title angle ideas, tag ideas, positioning notes, risks) to help the seller manually create or improve a listing.

The application is designed to use the Etsy Open API only (no scraping) and to respect Etsy policies and rate limits. Outputs are research briefs; listing creation and publishing remain manual by the seller.

## Notes
- If Etsy requires OAuth, we will implement OAuth for seller-authorized access.
- We do not need access to any Etsy user passwords.
