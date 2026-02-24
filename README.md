# Etsy Engine — Module 1: Structural Edge Analyzer

A local operator tool that pulls a snapshot of Etsy listings for a keyword, computes structural market signals, and generates a grounded Differentiation Brief using Gemini 2.0 Flash.

---

## Overview

Module 1 does exactly one thing: given a keyword, it tells you what's already in the market, what's missing, and what to build. No scraping — Etsy Open API v3 only.

**Pipeline:**
1. Fetch top N listings from Etsy Open API
2. Compute structural signals: price bands, title sameness (TF-IDF cosine), market dominance, format distribution, bundle depth
3. Generate a Differentiation Brief via Gemini 2.0 Flash (strict JSON schema, Zod-validated)
4. Run QA gates: generic phrase lint, specificity minimum, forbidden claims check, grounding check
5. Auto-regenerate once on QA failure; mark `needs_review` on second failure
6. Store everything in SQLite for reproducibility

---

## Prerequisites

- Node.js 22+
- npm 10+
- Etsy developer account (for real API calls) — or use mock LLM mode

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your credentials (see sections below).

### 3. Initialize the database

```bash
DATABASE_URL="file:./dev.db" npx prisma migrate dev --name init
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path — use `file:./dev.db` |
| `ETSY_API_KEY` | Yes (real) | Your Etsy app's API key (client ID) |
| `ETSY_SHARED_SECRET` | Yes (real) | Your Etsy app's shared secret |
| `ETSY_ACCESS_TOKEN` | Yes (real) | OAuth2 access token |
| `ETSY_REFRESH_TOKEN` | Optional | OAuth2 refresh token |
| `LLM_PROVIDER` | No | `mock` (default) or `gemini` |
| `GEMINI_API_KEY` | If `LLM_PROVIDER=gemini` | Google AI API key |

### Running in mock mode (no API keys needed)

```bash
LLM_PROVIDER=mock npm run dev
```

You still need `ETSY_API_KEY` and `ETSY_ACCESS_TOKEN` for fetching listings. Without them the app will show a setup error when you try to run a scan.

---

## Etsy OAuth2 Setup (Step-by-Step)

### Step 1: Create an Etsy developer account

Go to [https://www.etsy.com/developers](https://www.etsy.com/developers) and sign in.

### Step 2: Create a new app

1. Click **"Create a New App"**
2. Fill in: App Name, Description, Website URL (use `http://localhost:3000`)
3. Set **Callback URL** to `http://localhost:3000/api/auth/callback`
4. Select scopes: `listings_r`, `transactions_r`
5. Submit — Etsy will give you an **API Key (keystring)** and **Shared Secret**

### Step 3: Copy credentials

```env
ETSY_API_KEY="your_api_key_here"
ETSY_SHARED_SECRET="your_shared_secret_here"
```

### Step 4: Complete the OAuth2 PKCE flow

Etsy uses OAuth2 with PKCE. To get your access token:

1. Generate a code verifier and challenge (see [Etsy OAuth2 docs](https://developers.etsy.com/documentation/essentials/authentication))
2. Build the authorization URL:
   ```
   https://www.etsy.com/oauth/connect
     ?response_type=code
     &redirect_uri=http://localhost:3000/api/auth/callback
     &scope=listings_r%20transactions_r
     &client_id=YOUR_API_KEY
     &state=RANDOM_STATE
     &code_challenge=YOUR_CODE_CHALLENGE
     &code_challenge_method=S256
   ```
3. Open the URL in a browser, approve the app
4. Etsy redirects to your callback URL with `?code=AUTH_CODE`
5. Exchange the code for tokens via:
   ```
   POST https://api.etsy.com/v3/public/oauth/token
   {
     "grant_type": "authorization_code",
     "client_id": "YOUR_API_KEY",
     "redirect_uri": "http://localhost:3000/api/auth/callback",
     "code": "AUTH_CODE",
     "code_verifier": "YOUR_VERIFIER"
   }
   ```
6. Copy the returned `access_token` and `refresh_token` to `.env.local`

**Etsy access tokens expire after 3600 seconds.** The app's real client handles basic 429 rate limiting with retry logic.

### Step 5: Set Gemini API key (optional)

Get a key from [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY="your_key_here"
```

---

## How Module 1 Works

### Signals computed

| Signal | Method |
|---|---|
| Price bands | Percentile computation (p25, p50, p75, mode bucket) |
| Title sameness | TF-IDF vectors + cosine similarity matrix (O(N²), N≤100) |
| Market dominance | Shop ID grouping, top 3 shops' share |
| Format signals | Regex extraction from titles + tags (8 patterns) |
| Bundle depth | "includes X items" phrase parsing |

### Brief structure

1. **Market Standard** — what the market looks like now
2. **Differentiators** — 5+ specific, signal-grounded opportunities
3. **What's Missing** — 3+ observed gaps
4. **Buyer Frictions** — from review text (if enabled)
5. **Winning Build Spec** — core problem + must-have/avoid
6. **Premium Ladder** — Good/Better/Best tiers
7. **Listing Angle** — headline + image callouts
8. **Risk Flags** — with severity + mitigation

### QA gates

1. **Generic phrase lint** — rejects "unique", "high quality", etc.
2. **Specificity check** — min 5 differentiators, min 3 missing features
3. **Forbidden claims** — rejects search volume / revenue / sales velocity
4. **Grounding check** — every differentiator must cite a real signal field

Auto-regenerate once on first QA failure. Second failure → `needs_review` status.

### Signal Summary tiles

Each of the 4 signal tiles shows:
- Numeric value
- Threshold reference (e.g., `< 30% green · 30–50% yellow · > 50% red`)
- One-line interpretation

### Keyboard shortcuts

| Key | Action |
|---|---|
| `⌘↵` | Run scan |
| `B` | Mark as Build |
| `K` | Mark as Kill |
| `H` | Mark as Hold |

---

## Running Tests

```bash
npm test
```

34 unit tests covering:
- Price band computation (8 tests)
- TF-IDF title sameness (6 tests)
- Format signal regex (11 tests)
- QA gates (9 tests)

```bash
npm run typecheck   # TypeScript type checking
```

---

## Data Model

```
scans          — keyword, status, options
listings       — Etsy listing cache (24h TTL)
scan_listings  — many-to-many with rank index
signals        — computed SignalsResult JSON per scan
briefs         — DifferentiationBrief JSON + QA result
decisions      — Build / Kill / Hold + notes
```

---

## Project Structure

```
app/
  scan/page.tsx          — Scan form + SSE progress
  briefs/page.tsx        — History list
  briefs/[scanId]/       — Brief detail (split view)
  api/scan/stream/       — SSE endpoint

lib/
  etsy/                  — Real Etsy API client (OAuth2)
  signals/               — Price bands, TF-IDF, dominance, format, bundle
  llm/                   — Gemini/mock adapter + prompt builder + Zod schema
  qa/                    — 4 quality gate functions
  pipeline/              — Scan orchestrator + progress emitter + cache

actions/
  scan.ts                — startScan() server action
  decision.ts            — setDecision() server action
  export.ts              — exportBriefMarkdown() server action
```
