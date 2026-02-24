import type { DifferentiationBrief } from "@/types/brief";
import BriefSection from "./BriefSection";

const SEVERITY_COLORS = {
  red: "text-red-400",
  yellow: "text-yellow-400",
  green: "text-green-400",
  high: "text-red-400",
  medium: "text-yellow-400",
  low: "text-green-400",
};

export default function BriefSections({ brief }: { brief: DifferentiationBrief }) {
  return (
    <div className="space-y-4">
      {/* Market Standard */}
      <BriefSection
        title="Market Standard"
        copyText={`${brief.marketStandard.summary}\n\nFormats: ${brief.marketStandard.typicalFormats.join(", ")}\nPrice: ${brief.marketStandard.typicalPriceRange}`}
      >
        <p>{brief.marketStandard.summary}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {brief.marketStandard.typicalFormats.map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 text-xs bg-[#1a1a2e] border border-[#2d2d4e] rounded text-slate-400"
            >
              {f}
            </span>
          ))}
          <span className="px-2 py-0.5 text-xs bg-indigo-900/30 border border-indigo-700/30 rounded text-indigo-400">
            {brief.marketStandard.typicalPriceRange}
          </span>
        </div>
      </BriefSection>

      {/* Differentiators */}
      <BriefSection
        title={`Differentiators (${brief.differentiators.length})`}
        copyText={brief.differentiators
          .map((d) => `${d.id}. ${d.claim}\n   Signal: ${d.supportingSignal} — ${d.evidence}`)
          .join("\n\n")}
      >
        <div className="space-y-4">
          {brief.differentiators.map((d) => (
            <div key={d.id} className="space-y-1.5">
              <div className="flex gap-2">
                <span className="text-xs font-mono text-indigo-400 flex-shrink-0 mt-0.5">
                  {d.id}
                </span>
                <p className="text-slate-200">{d.claim}</p>
              </div>
              <div className="ml-6 text-xs text-slate-500 bg-[#0d0d1f] border border-[#2d2d4e] rounded px-2 py-1.5">
                <span className="text-indigo-500 font-mono">{d.supportingSignal}</span>
                <span className="mx-1">—</span>
                <span>{d.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </BriefSection>

      {/* What's Missing */}
      <BriefSection
        title={`What's Missing (${brief.missingFeatures.length})`}
        copyText={brief.missingFeatures
          .map((f) => `- ${f.feature}\n  ${f.rationale}`)
          .join("\n\n")}
      >
        <div className="space-y-3">
          {brief.missingFeatures.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="font-medium text-slate-200">{f.feature}</div>
              <div className="text-slate-500 text-xs">{f.rationale}</div>
              <div className="text-xs font-mono text-indigo-500">{f.supportingSignal}</div>
            </div>
          ))}
        </div>
      </BriefSection>

      {/* Buyer Frictions */}
      {brief.buyerFrictions.length > 0 && (
        <BriefSection
          title={`Buyer Frictions (${brief.buyerFrictions.length})`}
          copyText={brief.buyerFrictions
            .map((f) => `[${f.severity.toUpperCase()}] ${f.friction}`)
            .join("\n")}
        >
          <div className="space-y-3">
            {brief.buyerFrictions.map((f, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold uppercase ${SEVERITY_COLORS[f.severity]}`}>
                    {f.severity}
                  </span>
                  <span className="text-slate-300">{f.friction}</span>
                </div>
                {f.sourceReviews.slice(0, 2).map((r, ri) => (
                  <blockquote
                    key={ri}
                    className="ml-3 pl-3 border-l border-[#2d2d4e] text-xs text-slate-500 italic"
                  >
                    "{r}"
                  </blockquote>
                ))}
              </div>
            ))}
          </div>
        </BriefSection>
      )}

      {/* Winning Build Spec */}
      <BriefSection
        title="Winning Build Spec"
        copyText={`${brief.winningBuildSpec.coreProblemSolved}\n\nMust-have:\n${brief.winningBuildSpec.mustHaveFeatures.map((f) => `• ${f}`).join("\n")}\n\nMust avoid:\n${brief.winningBuildSpec.mustAvoid.map((f) => `• ${f}`).join("\n")}`}
      >
        <p className="text-slate-200 font-medium">{brief.winningBuildSpec.coreProblemSolved}</p>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-green-400 mb-2">Must-have</div>
            <ul className="space-y-1">
              {brief.winningBuildSpec.mustHaveFeatures.map((f, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-slate-400">
                  <span className="text-green-500 flex-shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold text-red-400 mb-2">Must avoid</div>
            <ul className="space-y-1">
              {brief.winningBuildSpec.mustAvoid.map((f, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-slate-400">
                  <span className="text-red-500 flex-shrink-0">✗</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BriefSection>

      {/* Premium Ladder */}
      <BriefSection
        title="Premium Ladder"
        copyText={brief.premiumLadder
          .map(
            (t) =>
              `${t.tier.toUpperCase()}: ${t.label} (${t.suggestedPriceRange})\n${t.features.map((f) => `• ${f}`).join("\n")}`
          )
          .join("\n\n")}
      >
        <div className="grid grid-cols-3 gap-3">
          {brief.premiumLadder.map((tier) => (
            <div
              key={tier.tier}
              className="bg-[#0d0d1f] border border-[#2d2d4e] rounded-lg p-3"
            >
              <div className="text-xs font-semibold uppercase text-slate-500 mb-1">
                {tier.tier}
              </div>
              <div className="text-sm font-medium text-slate-200 mb-1">{tier.label}</div>
              <div className="text-xs text-indigo-400 font-mono mb-3">
                {tier.suggestedPriceRange}
              </div>
              <ul className="space-y-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="text-xs text-slate-500 flex gap-1.5">
                    <span className="text-indigo-500 flex-shrink-0">·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </BriefSection>

      {/* Listing Angle */}
      <BriefSection
        title="Listing Angle"
        copyText={`${brief.listingAngle.headline}\n${brief.listingAngle.subheadline}\n\nImage callouts:\n${brief.listingAngle.imageCallouts.map((c) => `• ${c}`).join("\n")}`}
      >
        <div className="space-y-3">
          <div className="px-4 py-3 bg-[#0d0d1f] rounded border border-[#2d2d4e]">
            <div className="text-base font-bold text-slate-100">
              {brief.listingAngle.headline}
            </div>
            <div className="text-sm text-slate-400 mt-1">
              {brief.listingAngle.subheadline}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-2">Image callouts</div>
            <ul className="space-y-1.5">
              {brief.listingAngle.imageCallouts.map((c, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-xs text-slate-300 bg-[#1a1a2e] px-3 py-2 rounded border border-[#2d2d4e]"
                >
                  <span className="text-indigo-500 font-mono">{i + 1}</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </BriefSection>

      {/* Risk Flags */}
      <BriefSection
        title="Risk Flags"
        copyText={brief.riskFlags
          .map((r) => `[${r.severity.toUpperCase()}] ${r.flag}\nMitigation: ${r.mitigation}`)
          .join("\n\n")}
      >
        <div className="space-y-3">
          {brief.riskFlags.map((r, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-start gap-2">
                <span
                  className={`text-xs font-bold uppercase flex-shrink-0 mt-0.5 ${SEVERITY_COLORS[r.severity]}`}
                >
                  {r.severity}
                </span>
                <span className="text-slate-300 text-sm">{r.flag}</span>
              </div>
              <div className="ml-10 text-xs text-slate-500">
                <span className="text-slate-600">Mitigation: </span>
                {r.mitigation}
              </div>
            </div>
          ))}
        </div>
      </BriefSection>
    </div>
  );
}
