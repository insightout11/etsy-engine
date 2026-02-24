"use client";

import type { ScanStatus } from "@/types/scan";
import Spinner from "@/components/ui/Spinner";

const STAGES: { key: ScanStatus; label: string }[] = [
  { key: "queued", label: "Queued" },
  { key: "fetching", label: "Fetching" },
  { key: "analyzing", label: "Analyzing" },
  { key: "drafting", label: "Drafting Brief" },
];

const STAGE_ORDER: ScanStatus[] = ["queued", "fetching", "analyzing", "drafting", "complete", "needs_review"];

interface ProgressTrackerProps {
  status: ScanStatus;
  message: string;
  listingCount?: number;
  progress?: number;
}

export default function ProgressTracker({
  status,
  message,
  listingCount,
  progress,
}: ProgressTrackerProps) {
  const currentIdx = STAGE_ORDER.indexOf(status);
  const isComplete = status === "complete" || status === "needs_review";
  const isError = status === "error";

  return (
    <div className="space-y-4">
      {/* Stage indicators */}
      <div className="flex items-center gap-2">
        {STAGES.map((stage, idx) => {
          const stageIdx = STAGE_ORDER.indexOf(stage.key);
          const isPast = isComplete || currentIdx > stageIdx;
          const isActive = currentIdx === stageIdx && !isComplete;

          return (
            <div key={stage.key} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    isPast
                      ? "bg-indigo-600 text-white"
                      : isActive
                      ? "bg-indigo-600/30 border-2 border-indigo-500 text-indigo-300"
                      : "bg-[#1a1a2e] border border-[#2d2d4e] text-slate-500"
                  }`}
                >
                  {isPast ? "✓" : idx + 1}
                </div>
                <span
                  className={`text-xs font-medium truncate ${
                    isPast
                      ? "text-indigo-400"
                      : isActive
                      ? "text-slate-200"
                      : "text-slate-500"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-px ${
                    isPast ? "bg-indigo-600" : "bg-[#2d2d4e]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Message + spinner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a2e] rounded-lg border border-[#2d2d4e]">
        {isError ? (
          <span className="text-red-400 text-sm">✗</span>
        ) : isComplete ? (
          <span className="text-green-400 text-sm">✓</span>
        ) : (
          <Spinner size="sm" />
        )}
        <span className={`text-sm ${isError ? "text-red-400" : "text-slate-300"}`}>
          {message}
          {listingCount !== undefined && status === "fetching" && (
            <span className="text-slate-500 ml-2">({listingCount} fetched)</span>
          )}
        </span>
        {progress !== undefined && !isComplete && !isError && (
          <span className="ml-auto text-xs text-slate-500">{progress}%</span>
        )}
      </div>

      {/* Progress bar */}
      {!isError && (
        <div className="h-1 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? "bg-green-500" : "bg-indigo-500"
            }`}
            style={{
              width: isComplete
                ? "100%"
                : progress !== undefined
                ? `${progress}%`
                : `${(currentIdx / (STAGE_ORDER.length - 1)) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
