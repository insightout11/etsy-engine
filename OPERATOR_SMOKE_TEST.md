# Etsy Engine – Operator Smoke Test

**Modules covered:** Module 0 (Keyword Queue) + Module 1 (Scan / Brief)
**Estimated time:** 5–10 minutes
**Prerequisites:** Node 18+, npm, Git

---

## 0. Clone and install

```bash
git clone https://github.com/insightout11/etsy-engine.git
cd etsy-engine
npm install
```

**Expected:** dependencies install with no errors.

---

## 1. Configure environment

Copy the example file and set the minimum required values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
DATABASE_URL="file:./dev.db"
LLM_PROVIDER="mock"
ETSY_FIXTURE_MODE=1
```

Leave `ETSY_API_KEY`, `ETSY_ACCESS_TOKEN`, and `GEMINI_API_KEY` blank.
`ETSY_FIXTURE_MODE=1` routes all scoring through local fixture files (no API calls required).

---

## 2. Run database migration

```bash
DATABASE_URL="file:./dev.db" npx prisma migrate dev --name smoke-test
```

**Expected output contains:**
```
Your database is now in sync with your schema.
```

If the database already exists and is current, you will see:
```
Database schema is up to date!
```

Either is acceptable. If you see `EPERM` warnings about a `.dll.node` file on Windows, they are cosmetic — the migration still applies correctly.

---

## 3. Generate Prisma client

```bash
npx prisma generate
```

**Expected:** completes without error. Same Windows `EPERM` warning may appear; ignore it.

---

## 4. Unit tests

```bash
npm test
```

**Expected output:**
```
Test Files  7 passed (7)
Tests      49 passed (49)
```

All 7 test files must pass. Zero failures.

```bash
npm run typecheck
```

**Expected:** no output (zero TypeScript errors).

---

## 5. Start the dev server

```bash
npm run dev
```

**Expected:** server starts on port 3000 (or 3001 if 3000 is occupied). Look for:
```
▲ Next.js 15.x.x
- Local: http://localhost:3000
```

Keep this terminal running for the remaining steps.

---

## 6. Verify /queue loads

Open a browser to `http://localhost:3000/queue`.

**Expected:**
- Page loads with title "Keyword Queue"
- Seeds textarea is pre-filled with the contents of `seeds.txt` (10 example seeds)
- Toolbar shows "Score All" button and "Auto-batch OFF" toggle
- Candidate table is empty (no candidates yet)
- Sidebar shows three nav links: Queue, Scan, History

---

## 7. Expand seeds → candidates appear

In the seeds textarea, verify the default content (from `seeds.txt`):
```
wedding planner printable
budget tracker
...
```

Click **Expand Seeds**.

**Expected:**
- Page reloads (server action runs)
- Candidate table now shows rows; each row has status `new`
- Up to 200 candidates from the 10 default seeds (20 variants × 10 seeds, minus any duplicates)
- All rows show score `—` (not yet scored)

---

## 8. Score candidates

Click **Score All** in the toolbar.

> Note: This call runs real fixture data through the signals engine. With 200 candidates it may take 20–60 seconds depending on hardware.

**Expected:**
- Page reloads after completion
- Rows now show numeric scores (0–100 badge, color-coded)
- Row status changes from `new` → `scored`
- Click any row's keyword — the score badge should reflect the computed composite value

To verify DB storage directly:
```bash
DATABASE_URL="file:./dev.db" npx prisma studio
```
Open `keyword_candidates` table → confirm `score` and `score_json` columns are populated.

---

## 9. Promote a candidate

Find a candidate with a high score (green badge, 70+). Click **Promote**.

**Expected:**
- Row status changes from `scored` → `promoted`
- Promote and Reject buttons disappear; a **Run** button appears in the row

---

## 10. Run Next → scan starts

Click **Run** on the promoted candidate.

**Expected:**
- Candidate status changes to `scanned`
- Page reloads (server action completes)

Navigate to `http://localhost:3000/briefs`.

**Expected:**
- A new scan entry appears at the top of the list
- Status is one of: `complete`, `needs_review`, or still `drafting` (if the pipeline hasn't finished yet)
- Wait a few seconds and refresh — status should settle to `complete` or `needs_review` (LLM_PROVIDER=mock generates deterministic briefs in < 1 s)

Click the scan row to open the brief detail page.

**Expected:**
- Brief detail page loads with differentiation sections, risk flags, and winning build spec
- QA status shown (mock briefs pass QA by default)

---

## 11. Auto-batch toggle persistence

Click **Auto-batch OFF** in the toolbar — it should flip to **Auto-batch ON** and reveal a **Pause** button.
Click **Pause** — button changes to **Resume**.
Refresh the page.

**Expected:** both states (Auto-batch ON, paused) persist across page reload.

Click **Auto-batch ON** again to toggle back to OFF and clean up.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `EPERM` on migration | Prisma DLL locked by running process | Stop dev server, rerun migrate |
| Score All hangs indefinitely | `ETSY_FIXTURE_MODE` not set | Confirm `.env.local` has `ETSY_FIXTURE_MODE=1` |
| `/queue` shows 500 error | DB tables missing | Rerun `prisma migrate dev` |
| Brief never appears after Run | Mock LLM timeout | Check dev server terminal for error output |
| `ETSY_API_KEY missing` error | Fixture mode not active | Confirm `ETSY_FIXTURE_MODE=1` in `.env.local` |
