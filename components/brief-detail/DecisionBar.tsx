"use client";

import { useState, useEffect, useTransition } from "react";
import { setDecision } from "@/actions/decision";
import { exportBriefMarkdown } from "@/actions/export";
import type { DecisionValue } from "@/types/scan";

interface DecisionBarProps {
  scanId: number;
  currentDecision: DecisionValue | null;
  currentNotes: string;
  keyword: string;
}

const DECISION_STYLES: Record<DecisionValue, string> = {
  build: "bg-green-700 hover:bg-green-600 text-white border-green-600",
  kill: "bg-red-700 hover:bg-red-600 text-white border-red-600",
  hold: "bg-yellow-700 hover:bg-yellow-600 text-white border-yellow-600",
};

const DECISION_ACTIVE: Record<DecisionValue, string> = {
  build: "ring-2 ring-green-400 ring-offset-2 ring-offset-[#0f0f1a]",
  kill: "ring-2 ring-red-400 ring-offset-2 ring-offset-[#0f0f1a]",
  hold: "ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#0f0f1a]",
};

export default function DecisionBar({
  scanId,
  currentDecision,
  currentNotes,
  keyword,
}: DecisionBarProps) {
  const [decision, setLocalDecision] = useState<DecisionValue | null>(currentDecision);
  const [notes, setNotes] = useState(currentNotes);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Keyboard shortcuts: b = build, k = kill, h = hold
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Ignore when typing in inputs
      if (
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "INPUT"
      )
        return;

      if (e.key === "b" || e.key === "B") handleDecision("build");
      if (e.key === "k" || e.key === "K") handleDecision("kill");
      if (e.key === "h" || e.key === "H") handleDecision("hold");
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [notes]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDecision(d: DecisionValue) {
    setLocalDecision(d);
    startTransition(async () => {
      await setDecision(scanId, d, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function handleExport() {
    const { markdown, filename } = await exportBriefMarkdown(scanId);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="sticky bottom-0 bg-[#0f0f1a] border-t border-[#2d2d4e] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4 flex-wrap">
        {/* Decision buttons */}
        <div className="flex gap-2">
          {(["build", "kill", "hold"] as DecisionValue[]).map((d) => (
            <button
              key={d}
              onClick={() => handleDecision(d)}
              disabled={isPending}
              className={`px-4 py-2 text-sm font-medium rounded-lg border capitalize transition-colors disabled:opacity-50 ${
                DECISION_STYLES[d]
              } ${decision === d ? DECISION_ACTIVE[d] : ""}`}
            >
              <kbd className="text-[10px] opacity-50 mr-1 font-mono">
                {d[0].toUpperCase()}
              </kbd>
              {d}
            </button>
          ))}
        </div>

        {/* Notes */}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (decision) {
              startTransition(async () => {
                await setDecision(scanId, decision, notes);
              });
            }
          }}
          placeholder="Add notes..."
          rows={1}
          className="flex-1 px-3 py-2 text-sm bg-[#1a1a2e] border border-[#2d2d4e] rounded-lg text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none min-w-48"
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-xs text-green-400">✓ Saved</span>
          )}
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm bg-[#1a1a2e] hover:bg-[#2d2d4e] border border-[#2d2d4e] text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            Export MD
          </button>
        </div>
      </div>
    </div>
  );
}
