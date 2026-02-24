import type { SignalsResult, SignalTile, SignalRiskLevel } from "@/types/signals";

const RISK_RULES: Array<{
  label: string;
  compute: (s: SignalsResult) => SignalRiskLevel;
  getValue: (s: SignalsResult) => number;
  format: (v: number) => string;
  threshold: string;
  interpret: (s: SignalsResult, level: SignalRiskLevel) => string;
}> = [
  {
    label: "Title Sameness",
    compute: (s) =>
      s.titleSameness.averageSimilarity > 0.7
        ? "red"
        : s.titleSameness.averageSimilarity > 0.4
        ? "yellow"
        : "green",
    getValue: (s) => s.titleSameness.averageSimilarity,
    format: (v) => v.toFixed(2),
    threshold: "< 0.4 green · 0.4–0.7 yellow · > 0.7 red",
    interpret: (s, level) =>
      level === "red"
        ? "Market is highly homogeneous — title differentiation is critical"
        : level === "yellow"
        ? "Moderate title repetition — some room for distinctive framing"
        : "Titles vary widely — new listing can stand out easily",
  },
  {
    label: "Market Dominance",
    compute: (s) =>
      s.dominance.top3SharePercent > 50
        ? "red"
        : s.dominance.top3SharePercent > 30
        ? "yellow"
        : "green",
    getValue: (s) => s.dominance.top3SharePercent,
    format: (v) => `${v}%`,
    threshold: "< 30% green · 30–50% yellow · > 50% red",
    interpret: (s, level) =>
      level === "red"
        ? `Top 3 shops hold ${s.dominance.top3SharePercent}% of results — concentrated market`
        : level === "yellow"
        ? `Top 3 shops hold ${s.dominance.top3SharePercent}% — moderate concentration`
        : `Top 3 shops hold ${s.dominance.top3SharePercent}% — fragmented market, easier entry`,
  },
  {
    label: "Format Diversity",
    compute: (s) =>
      s.formatSignals.distinctTypeCount <= 2
        ? "red"
        : s.formatSignals.distinctTypeCount <= 4
        ? "yellow"
        : "green",
    getValue: (s) => s.formatSignals.distinctTypeCount,
    format: (v) => `${v} types`,
    threshold: "≤ 2 red · 3–4 yellow · 5+ green",
    interpret: (s, level) =>
      level === "red"
        ? `Only ${s.formatSignals.distinctTypeCount} format types detected — market is narrow`
        : level === "yellow"
        ? `${s.formatSignals.distinctTypeCount} format types — moderate diversity`
        : `${s.formatSignals.distinctTypeCount} format types — rich signal landscape`,
  },
  {
    label: "Price Spread",
    compute: (s) => {
      const spread = s.priceBands.p75 - s.priceBands.p25;
      return spread < 5 ? "red" : spread <= 10 ? "yellow" : "green";
    },
    getValue: (s) => s.priceBands.p75 - s.priceBands.p25,
    format: (v) => `$${v.toFixed(0)}`,
    threshold: "< $5 red · $5–$10 yellow · > $10 green",
    interpret: (s, level) => {
      const spread = (s.priceBands.p75 - s.priceBands.p25).toFixed(0);
      return level === "red"
        ? `$${spread} p25–p75 spread — severe price compression`
        : level === "yellow"
        ? `$${spread} spread — moderate price competition`
        : `$${spread} spread — room for premium pricing`;
    },
  },
];

const LEVEL_STYLES: Record<SignalRiskLevel, { border: string; bg: string; text: string; dot: string }> = {
  red: {
    border: "border-red-700/40",
    bg: "bg-red-900/20",
    text: "text-red-300",
    dot: "bg-red-500",
  },
  yellow: {
    border: "border-yellow-700/40",
    bg: "bg-yellow-900/20",
    text: "text-yellow-300",
    dot: "bg-yellow-500",
  },
  green: {
    border: "border-green-700/40",
    bg: "bg-green-900/20",
    text: "text-green-300",
    dot: "bg-green-500",
  },
};

export function computeSignalTiles(signals: SignalsResult): SignalTile[] {
  return RISK_RULES.map((rule) => {
    const rawValue = rule.getValue(signals);
    const level = rule.compute(signals);
    return {
      label: rule.label,
      value: rule.format(rawValue),
      rawValue,
      level,
      threshold: rule.threshold,
      interpretation: rule.interpret(signals, level),
    };
  });
}

export default function RiskDashboard({ signals }: { signals: SignalsResult }) {
  const tiles = computeSignalTiles(signals);

  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Signal Summary
      </div>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => {
          const style = LEVEL_STYLES[tile.level];
          return (
            <div
              key={tile.label}
              className={`rounded-lg border ${style.border} ${style.bg} p-3`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-slate-400">{tile.label}</span>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${style.dot}`} />
              </div>
              <div className={`text-lg font-bold font-mono ${style.text}`}>
                {tile.value}
              </div>
              <div className="text-[10px] text-slate-600 mt-1">{tile.threshold}</div>
              <div className={`text-xs mt-2 ${style.text} opacity-80 leading-relaxed`}>
                {tile.interpretation}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
