export const dynamic = 'force-static';

function Shot({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      <div className="mt-1 text-sm text-neutral-600">{desc}</div>
      <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
        Screenshot placeholder (will be replaced with real UI)
      </div>
    </div>
  );
}

export default function EtsyEngineAppInfoPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Etsy Engine — App Overview (In Development)</h1>
        <p className="text-neutral-700">
          Etsy Engine is an in-development tool for Etsy sellers to improve product research and listing quality.
          It uses the Etsy Open API to fetch marketplace signals and generate structured briefs.
        </p>
        <p className="text-sm text-neutral-600">
          Status: early development • This page exists to describe the planned features and API usage.
        </p>
      </header>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Core features</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>
            <strong>Keyword Queue</strong>: seed keywords → expansion → scoring → user approval into a queue.
          </li>
          <li>
            <strong>Market Scan</strong>: fetch search/listing signals via API and summarize competition and differentiation.
          </li>
          <li>
            <strong>Brief Generator</strong>: produce a structured listing brief (title angle ideas, tags, positioning notes).
          </li>
          <li>
            <strong>Fixture / Mock Mode</strong>: supports testing without live Etsy API access while in review.
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">Screens (placeholders)</h2>
        <p className="text-sm text-neutral-600">
          You can also click through the current UI (in development):{' '}
          <a className="underline" href="/queue">/queue</a>,{' '}
          <a className="underline" href="/scan">/scan</a>,{' '}
          <a className="underline" href="/briefs">/briefs</a>.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Shot
            title="Keyword Queue"
            desc="Enter seed keywords, expand candidates, score/rank, then approve into the queue."
          />
          <Shot
            title="Market Scan"
            desc="Review a market summary with competition signals and positioning notes."
          />
          <Shot
            title="Brief Output"
            desc="Generate a structured brief (angles, tags, risks) for manual listing creation."
          />
          <Shot
            title="Queue Review"
            desc="Manually curate the queue; no automated posting."
          />
        </div>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-xl font-semibold">API usage & compliance</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-700">
          <li>
            Etsy Engine is intended to use the <strong>Etsy Open API</strong> only. No scraping.
          </li>
          <li>
            The app performs read-only marketplace research calls (e.g., listing/search/shop data where permitted).
          </li>
          <li>
            The tool is designed to respect rate limits and Etsy policies.
          </li>
          <li>
            Outputs are research briefs; final listing creation/publishing is manual by the seller.
          </li>
        </ul>
        <p className="text-sm text-neutral-600">
          Questions: <a className="underline" href="mailto:insightout11@gmail.com">insightout11@gmail.com</a>
        </p>
      </section>

      <footer className="mt-12 border-t pt-6 text-sm text-neutral-600">
        <p>
          Terms: <a className="underline" href="https://www.etsy.com/legal/api/">https://www.etsy.com/legal/api/</a>
        </p>
      </footer>
    </main>
  );
}
