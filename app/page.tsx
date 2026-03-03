export const dynamic = 'force-static';

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-100">Etsy Engine</h1>
      <p className="mt-2 text-slate-300">
        In-development toolkit for Etsy sellers: keyword queue → market scan → structured briefs.
      </p>

      <div className="mt-8 grid gap-3">
        <a
          className="block rounded-xl border border-[#2d2d4e] bg-[#0d0d1f] px-4 py-3 hover:border-indigo-500/60 hover:bg-[#12122b] transition-colors"
          href="/queue"
        >
          <div className="font-semibold text-slate-100">Keyword Queue</div>
          <div className="text-sm text-slate-400">Seeds → expansion → scoring → approval into a queue.</div>
        </a>
        <a
          className="block rounded-xl border border-[#2d2d4e] bg-[#0d0d1f] px-4 py-3 hover:border-indigo-500/60 hover:bg-[#12122b] transition-colors"
          href="/scan"
        >
          <div className="font-semibold text-slate-100">Market Scan</div>
          <div className="text-sm text-slate-400">Summaries (fixture mode supported while API key is pending).</div>
        </a>
        <a
          className="block rounded-xl border border-[#2d2d4e] bg-[#0d0d1f] px-4 py-3 hover:border-indigo-500/60 hover:bg-[#12122b] transition-colors"
          href="/briefs"
        >
          <div className="font-semibold text-slate-100">History</div>
          <div className="text-sm text-slate-400">Prior scans and generated briefs.</div>
        </a>
        <a
          className="block rounded-xl border border-[#2d2d4e] bg-[#0d0d1f] px-4 py-3 hover:border-indigo-500/60 hover:bg-[#12122b] transition-colors"
          href="/etsy-engine"
        >
          <div className="font-semibold text-slate-100">App overview (for Etsy API review)</div>
          <div className="text-sm text-slate-400">Features, workflow, and API usage/compliance notes.</div>
        </a>
      </div>
    </main>
  );
}
