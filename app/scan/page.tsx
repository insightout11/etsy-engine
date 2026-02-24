"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { startScan } from "@/actions/scan";
import AdvancedOptions from "@/components/scan/AdvancedOptions";
import ProgressTracker from "@/components/scan/ProgressTracker";
import WarningsBox from "@/components/scan/WarningsBox";
import type { ScanStatus, ProgressEvent } from "@/types/scan";

export default function ScanPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const keywordRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<ScanStatus>("queued");
  const [scanMessage, setScanMessage] = useState("");
  const [listingCount, setListingCount] = useState<number | undefined>();
  const [progress, setProgress] = useState<number | undefined>();
  const [warnings, setWarnings] = useState<string[]>([]);
  const [completedScanId, setCompletedScanId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cmd+Enter shortcut to submit form
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !isScanning) {
        formRef.current?.requestSubmit();
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isScanning]);

  const subscribeToScan = useCallback((scanId: number) => {
    const evtSource = new EventSource(`/api/scan/stream?scanId=${scanId}`);

    evtSource.onmessage = (e) => {
      const event = JSON.parse(e.data as string) as ProgressEvent;

      setScanStatus(event.phase as ScanStatus);
      setScanMessage(event.message);
      if (event.listingCount !== undefined) setListingCount(event.listingCount);
      if (event.progress !== undefined) setProgress(event.progress);
      if (event.warnings?.length) setWarnings(event.warnings);

      if (
        event.phase === "complete" ||
        event.phase === "needs_review"
      ) {
        setIsScanning(false);
        setCompletedScanId(scanId);
        evtSource.close();
      }

      if (event.phase === "error") {
        setIsScanning(false);
        setError(event.message);
        evtSource.close();
      }
    };

    evtSource.onerror = () => {
      evtSource.close();
      // SSE closed — check scan status via navigation if we have a scanId
    };

    return () => evtSource.close();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setWarnings([]);
    setCompletedScanId(null);
    setProgress(undefined);
    setListingCount(undefined);

    const formData = new FormData(e.currentTarget);
    const keyword = (formData.get("keyword") as string)?.trim();

    if (!keyword) return;

    setIsScanning(true);
    setScanStatus("queued");
    setScanMessage("Starting scan...");

    const result = await startScan(formData);

    if (result.error) {
      setIsScanning(false);
      setError(result.error);
      return;
    }

    subscribeToScan(result.scanId);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Scan a Keyword</h1>
        <p className="text-sm text-slate-500 mt-1">
          Pull a snapshot of Etsy listings and generate a Differentiation Brief.
        </p>
      </div>

      {/* Scan form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <input
            ref={keywordRef}
            type="text"
            name="keyword"
            placeholder='e.g. "airbnb welcome book template"'
            required
            minLength={2}
            disabled={isScanning}
            className="flex-1 px-4 py-3 text-sm bg-[#1a1a2e] border border-[#2d2d4e] rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isScanning}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                Run Analysis
                <kbd className="text-[10px] px-1.5 py-0.5 bg-indigo-700 rounded font-mono opacity-70">
                  ⌘↵
                </kbd>
              </>
            )}
          </button>
        </div>

        <AdvancedOptions />
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 bg-red-900/20 border border-red-700/40 rounded-lg text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Progress */}
      {isScanning && (
        <div className="mt-8 space-y-4">
          <ProgressTracker
            status={scanStatus}
            message={scanMessage}
            listingCount={listingCount}
            progress={progress}
          />
          <WarningsBox warnings={warnings} />
        </div>
      )}

      {/* Completed */}
      {!isScanning && completedScanId && (
        <div className="mt-8 space-y-4">
          <ProgressTracker
            status={scanStatus}
            message={scanMessage}
            listingCount={listingCount}
            progress={100}
          />
          <WarningsBox warnings={warnings} />

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/briefs/${completedScanId}`)}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              View Brief →
            </button>
            <button
              onClick={() => {
                setCompletedScanId(null);
                setIsScanning(false);
                setScanStatus("queued");
                setScanMessage("");
                setWarnings([]);
                keywordRef.current?.focus();
              }}
              className="px-4 py-3 bg-[#1a1a2e] hover:bg-[#2d2d4e] text-slate-400 hover:text-slate-200 text-sm rounded-lg border border-[#2d2d4e] transition-colors"
            >
              New Scan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
