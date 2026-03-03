export const dynamic = 'force-static';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Etsy Engine</h1>
      <p className="mt-2 text-neutral-700">
        In-development toolkit for Etsy sellers: keyword queue → market scan → structured briefs.
      </p>

      <div className="mt-8 grid gap-3">
        <a className="rounded-lg border px-4 py-3 hover:bg-neutral-50" href="/queue">
          <div className="font-semibold">Keyword Queue</div>
          <div className="text-sm text-neutral-600">Seeds → expansion → scoring → approval into a queue.</div>
        </a>
        <a className="rounded-lg border px-4 py-3 hover:bg-neutral-50" href="/scan">
          <div className="font-semibold">Market Scan</div>
          <div className="text-sm text-neutral-600">Summaries (fixture mode supported while API key is pending).</div>
        </a>
        <a className="rounded-lg border px-4 py-3 hover:bg-neutral-50" href="/etsy-engine">
          <div className="font-semibold">App overview (for Etsy API review)</div>
          <div className="text-sm text-neutral-600">Features, workflow, and API usage/compliance notes.</div>
        </a>
      </div>
    </main>
  );
}
