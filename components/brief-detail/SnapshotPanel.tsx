import type { SignalsResult } from "@/types/signals";
import RiskDashboard from "./RiskDashboard";

export default function SnapshotPanel({ signals }: { signals: SignalsResult }) {
  const { priceBands, titleSameness, dominance, formatSignals } = signals;

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className="p-4 bg-[#1a1a2e] rounded-lg border border-[#2d2d4e] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Listings analyzed</span>
          <span className="font-mono text-slate-200">{signals.listingCount}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Median price</span>
          <span className="font-mono text-slate-200">${priceBands.median}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">p25 – p75</span>
          <span className="font-mono text-slate-200">
            ${priceBands.p25} – ${priceBands.p75}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Price range</span>
          <span className="font-mono text-slate-200">
            ${priceBands.min} – ${priceBands.max}
          </span>
        </div>
      </div>

      {/* Signal Summary */}
      <RiskDashboard signals={signals} />

      {/* Format breakdown */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Format Signals
        </div>
        <div className="space-y-1.5">
          {[
            { label: "Canva", value: formatSignals.canva },
            { label: "PDF", value: formatSignals.pdf },
            { label: "Editable", value: formatSignals.editable },
            { label: "Bundle/Kit", value: formatSignals.bundleKitSystem },
            { label: "Instant Download", value: formatSignals.instantDownload },
            { label: "Google Sheets", value: formatSignals.googleSheets },
            { label: "Notion", value: formatSignals.notion },
          ]
            .filter((f) => f.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((f) => (
              <div key={f.label} className="flex items-center gap-2">
                <div className="text-xs text-slate-500 w-28 flex-shrink-0">{f.label}</div>
                <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(f.value / signals.listingCount) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 w-8 text-right">
                  {f.value}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Top repeated phrases */}
      {titleSameness.topPhrases.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Top Repeated Phrases
          </div>
          <div className="flex flex-wrap gap-2">
            {titleSameness.topPhrases.slice(0, 8).map((p) => (
              <span
                key={p.phrase}
                className="px-2 py-1 text-xs bg-[#1a1a2e] border border-[#2d2d4e] rounded text-slate-400"
                title={`Appears in ${p.count} titles`}
              >
                {p.phrase}
                <span className="ml-1.5 text-slate-600">{p.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Market dominance */}
      <div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Top Shops
        </div>
        <div className="space-y-1.5">
          {dominance.topShops.map((shop, i) => (
            <div key={shop.shopId} className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 w-4">#{i + 1}</span>
              <span className="text-slate-400 font-mono truncate flex-1">
                shop {shop.shopId}
              </span>
              <span className="text-slate-500">{shop.listingCount} listings</span>
              <span className="text-slate-400 font-mono w-10 text-right">
                {shop.sharePercent}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
