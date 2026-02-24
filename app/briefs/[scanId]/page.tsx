import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import type { DifferentiationBrief } from "@/types/brief";
import type { SignalsResult } from "@/types/signals";
import type { QAResult } from "@/types/qa";
import SnapshotPanel from "@/components/brief-detail/SnapshotPanel";
import BriefSections from "@/components/brief-detail/BriefSections";
import DecisionBar from "@/components/brief-detail/DecisionBar";
import Badge from "@/components/ui/Badge";
import type { DecisionValue } from "@/types/scan";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ scanId: string }>;
}

export default async function BriefDetailPage({ params }: PageProps) {
  const { scanId: scanIdStr } = await params;
  const scanId = parseInt(scanIdStr, 10);

  if (isNaN(scanId)) notFound();

  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      brief: true,
      signals: true,
      decision: true,
    },
  });

  if (!scan) notFound();

  if (!scan.brief || !scan.signals) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="p-6 bg-[#1a1a2e] border border-[#2d2d4e] rounded-lg text-center text-slate-400">
          {scan.status === "error" ? (
            <>
              <div className="text-red-400 text-lg mb-2">Scan failed</div>
              <div className="text-sm">{scan.errorMessage ?? "An unknown error occurred."}</div>
            </>
          ) : (
            <>
              <div className="text-slate-300 text-lg mb-2">Scan in progress</div>
              <div className="text-sm">Status: {scan.status}</div>
            </>
          )}
        </div>
      </div>
    );
  }

  const brief = JSON.parse(scan.brief.briefJson) as DifferentiationBrief;
  const signals = JSON.parse(scan.signals.signalsJson) as SignalsResult;
  const qa = JSON.parse(scan.brief.qaJson) as QAResult;

  const scanDate = new Date(scan.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#2d2d4e] flex items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-bold text-slate-100 truncate">
            {scan.keyword}
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            {scanDate} · {signals.listingCount} listings · Scan #{scan.id}
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {scan.status === "needs_review" && (
            <Badge variant="needs_review">needs review</Badge>
          )}
          {scan.decision && (
            <Badge variant={scan.decision.decision as DecisionValue}>
              {scan.decision.decision}
            </Badge>
          )}
          {!qa.passed && (
            <span className="text-xs text-yellow-500">
              ⚠ {qa.issues.filter((i) => i.severity === "error").length} QA errors
            </span>
          )}
        </div>
      </div>

      {/* QA issues banner */}
      {!qa.passed && (
        <div className="px-6 py-3 bg-yellow-900/20 border-b border-yellow-700/30">
          <div className="text-xs font-medium text-yellow-400 mb-1">
            QA issues detected (attempt {qa.attemptNumber}/{2})
          </div>
          <div className="text-xs text-yellow-200/60 space-y-0.5">
            {qa.issues
              .filter((i) => i.severity === "error")
              .map((issue, i) => (
                <div key={i}>· {issue.message}</div>
              ))}
          </div>
        </div>
      )}

      {/* Two-column body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Snapshot signals */}
        <div className="w-72 flex-shrink-0 overflow-y-auto p-4 border-r border-[#2d2d4e]">
          <SnapshotPanel signals={signals} />
        </div>

        {/* Right: Brief sections */}
        <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-4">
          <BriefSections brief={brief} />
        </div>
      </div>

      {/* Sticky decision bar */}
      <DecisionBar
        scanId={scan.id}
        currentDecision={(scan.decision?.decision as DecisionValue) ?? null}
        currentNotes={scan.decision?.notes ?? ""}
        keyword={scan.keyword}
      />
    </div>
  );
}
