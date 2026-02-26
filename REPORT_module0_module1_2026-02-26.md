# Etsy Engine – Module 0 + Module 1 Test Report

**Date:** 2026-02-26
**Commit:** `a85fe1b64af96c222bc0757f123c53e925f45d7f`
**Branch:** `main`
**Environment:** Windows 11, Node 18+, Next.js 15.1.6, Prisma 5.22.0, Vitest 2.1.9

---

## Scope

| Module | Feature | Tested |
|---|---|---|
| Module 0 | Keyword expansion (mock mode) | ✅ |
| Module 0 | Candidate scoring — fixture mode | ✅ |
| Module 0 | Candidate scoring — real Etsy API | ⛔ blocked (see below) |
| Module 0 | Promote / reject / run next | ✅ (logic) |
| Module 0 | Queue settings persist (auto-batch, pause) | ✅ (logic) |
| Module 1 | Signals engine (price, title, dominance, format, bundle) | ✅ |
| Module 1 | LLM brief generation — mock provider | ✅ |
| Module 1 | LLM brief generation — Gemini | ⛔ blocked (no key) |
| Module 1 | QA gates (forbidden claims, specificity, grounding) | ✅ |
| Module 1 | Scan pipeline end-to-end | ✅ (logic) |

---

## Automated test results

```
npm test

Test Files  7 passed (7)
Tests      49 passed (49)
Duration   ~1.2 s
```

```
npm run typecheck

(no output — zero TypeScript errors)
```

### Test file breakdown

| File | Tests | Result |
|---|---|---|
| `unit/format-signals.test.ts` | 11 | ✅ pass |
| `unit/price-bands.test.ts` | 8 | ✅ pass |
| `unit/title-sameness.test.ts` | 6 | ✅ pass |
| `unit/qa-gates.test.ts` | 9 | ✅ pass |
| `unit/keyword-queue/expand-seeds.test.ts` | 6 | ✅ pass |
| `unit/keyword-queue/score-candidate.test.ts` | 7 | ✅ pass |
| `unit/keyword-queue/score-candidate-fixture.test.ts` | 2 | ✅ pass |

---

## Database migration

```
DATABASE_URL="file:./dev.db" npx prisma migrate status

2 migrations found in prisma/migrations
Database schema is up to date!
```

Both migrations applied cleanly:
- `20260222045058_init` — Module 1 tables (scans, listings, signals, briefs, decisions)
- `20260225060556_add_keyword_queue` — Module 0 tables (keyword_candidates, queue_settings)

**Warning observed (non-fatal, Windows only):**
```
EPERM: operation not permitted, rename '...\query_engine-windows.dll.node.tmp...'
```
This occurs on `prisma migrate dev` when the dev server or another process holds the Prisma query engine DLL. The migration applies correctly regardless. Workaround: stop the dev server before running migrations.

---

## Errors and warnings encountered

| # | Location | Severity | Description |
|---|---|---|---|
| 1 | `prisma migrate dev` on Windows | Warning | EPERM on DLL rename (cosmetic; migration succeeds) |
| 2 | `actions/queue.ts` initial write | Build error (fixed) | `skipDuplicates: true` not supported by Prisma SQLite — removed; `expandSeeds` pre-filters duplicates instead |
| 3 | Vitest CJS warning | Warning | `The CJS build of Vite's Node API is deprecated` — emitted by Vitest 2.x; does not affect test results |

No runtime errors observed in automated tests. No TypeScript errors.

---

## Known blockers for real Etsy mode

**Etsy API approval pending.**

The real `getEtsyClient()` requires `ETSY_API_KEY` and `ETSY_ACCESS_TOKEN`. Obtaining these requires:

1. Registering an app at `https://www.etsy.com/developers/`
2. Completing Etsy's OAuth2 review process (typically 1–4 weeks)
3. Receiving production API access (sandbox access alone does not support `searchListings`)

Until approval, scoring operates entirely from local fixture files (`fixtures/etsy/`) via `ETSY_FIXTURE_MODE=1` or absent credentials. Fixture data covers three keyword families: `wedding`, `budget`, and generic digital products.

**Gemini LLM** is similarly blocked — `GEMINI_API_KEY` not configured. Mock provider is active (`LLM_PROVIDER=mock`), producing deterministic briefs that pass QA gates without real market analysis.

---

## Next recommended build step after Etsy approval

**Wire real Etsy data into the scoring pipeline and validate signal quality.**

Specifically:
1. Set `ETSY_API_KEY`, `ETSY_ACCESS_TOKEN` in `.env.local`; remove `ETSY_FIXTURE_MODE`
2. Run Score All on a batch of ~20 promoted candidates using real listings
3. Spot-check composite scores against manual Etsy search inspection (do high-score keywords actually look underserved?)
4. Tune `SIGNAL_WEIGHTS` constants in `contracts/keyword-candidate.ts` if scores are systematically miscalibrated
5. Set `LLM_PROVIDER=gemini` and validate brief quality on 3–5 real keyword scans before enabling auto-batch
