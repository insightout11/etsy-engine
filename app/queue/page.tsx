import { prisma } from "@/lib/db/client";
import fs from "fs";
import path from "path";
import {
  expandAndQueue,
  scoreAll,
  promoteCandidate,
  rejectCandidate,
  toggleAutoBatch,
  pauseQueue,
  resumeQueue,
  runNextManual,
} from "@/actions/queue";

export const dynamic = "force-dynamic";

const STATUS_TABS = [
  "all",
  "new",
  "scored",
  "promoted",
  "scanned",
  "rejected",
  "error",
] as const;
type StatusTab = (typeof STATUS_TABS)[number];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-slate-700 text-slate-300",
  scored: "bg-blue-900/40 text-blue-300",
  promoted: "bg-indigo-900/40 text-indigo-300",
  scanning: "bg-purple-900/40 text-purple-300",
  scanned: "bg-green-900/40 text-green-300",
  rejected: "bg-red-900/40 text-red-400",
  error: "bg-orange-900/40 text-orange-400",
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-500">
        —
      </span>
    );
  }
  const color =
    score >= 70
      ? "bg-green-900/40 text-green-400"
      : score >= 40
        ? "bg-yellow-900/40 text-yellow-400"
        : "bg-red-900/40 text-red-400";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-mono ${color}`}>
      {score.toFixed(0)}
    </span>
  );
}

export default async function QueuePage(props: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await props.searchParams;
  const activeTab: StatusTab =
    STATUS_TABS.includes(sp.status as StatusTab)
      ? (sp.status as StatusTab)
      : "all";

  // Fetch candidates
  const candidates = await prisma.keywordCandidate.findMany({
    where: activeTab !== "all" ? { status: activeTab } : undefined,
    orderBy: [{ score: "desc" }, { id: "asc" }],
  });

  // Fetch or create queue settings
  const settings = await prisma.queueSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  // Count by status for tab badges
  const counts = await prisma.keywordCandidate.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const countMap: Record<string, number> = { all: 0 };
  for (const row of counts) {
    countMap[row.status] = row._count.id;
    countMap.all = (countMap.all ?? 0) + row._count.id;
  }

  // Pre-fill seeds textarea
  let seedsDefault = "";
  try {
    seedsDefault = fs.readFileSync(
      path.join(process.cwd(), "seeds.txt"),
      "utf8"
    );
  } catch {
    seedsDefault = "";
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Keyword Queue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Discover, score, and promote keyword candidates before running full
          scans.
        </p>
      </div>

      {/* Seeds section */}
      <div className="bg-[#0d0d1f] border border-[#2d2d4e] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-3">
          Expand Seeds
        </h2>
        <form action={expandAndQueue} className="space-y-3">
          <textarea
            name="seeds"
            rows={5}
            defaultValue={seedsDefault}
            placeholder="Enter seed keywords, one per line…"
            className="w-full bg-[#0f0f1a] border border-[#2d2d4e] rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-y font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Expand Seeds
          </button>
        </form>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <form action={scoreAll}>
          <button
            type="submit"
            className="px-4 py-2 bg-[#0d0d1f] border border-[#2d2d4e] hover:border-indigo-500 text-slate-300 text-sm font-medium rounded-lg transition-colors"
          >
            Score All
          </button>
        </form>

        <form action={toggleAutoBatch}>
          <button
            type="submit"
            className={`px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
              settings.autoBatch
                ? "bg-indigo-600/20 border-indigo-600/50 text-indigo-300"
                : "bg-[#0d0d1f] border-[#2d2d4e] text-slate-400 hover:border-indigo-500"
            }`}
          >
            Auto-batch {settings.autoBatch ? "ON" : "OFF"}
          </button>
        </form>

        {settings.autoBatch && (
          <form action={settings.paused ? resumeQueue : pauseQueue}>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0d0d1f] border border-[#2d2d4e] hover:border-yellow-500 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
            >
              {settings.paused ? "Resume" : "Pause"}
            </button>
          </form>
        )}

        <span className="ml-auto text-xs text-slate-500">
          {countMap.all ?? 0} total candidates
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-[#2d2d4e]">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab}
            href={tab === "all" ? "/queue" : `/queue?status=${tab}`}
            className={`px-3 py-2 text-xs font-medium capitalize transition-colors rounded-t-md ${
              activeTab === tab
                ? "bg-indigo-600/20 text-indigo-300 border-b-2 border-indigo-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab}
            {countMap[tab] != null && (
              <span className="ml-1.5 text-[10px] text-slate-500">
                ({countMap[tab]})
              </span>
            )}
          </a>
        ))}
      </div>

      {/* Candidate table */}
      {candidates.length === 0 ? (
        <p className="text-sm text-slate-500 py-8 text-center">
          No candidates in this status.{" "}
          {activeTab === "all" && "Expand some seeds to get started."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d2d4e] text-left text-xs text-slate-500 uppercase tracking-wide">
                <th className="pb-2 pr-4 font-medium">Keyword</th>
                <th className="pb-2 pr-4 font-medium">Seed</th>
                <th className="pb-2 pr-4 font-medium">Track</th>
                <th className="pb-2 pr-4 font-medium">Score</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a2e]">
              {candidates.map((c) => {
                const promoteBound = promoteCandidate.bind(null, c.id);
                const rejectBound = rejectCandidate.bind(null, c.id);
                const canPromote = c.status === "new" || c.status === "scored";
                const canReject = !["scanned", "scanning", "rejected"].includes(
                  c.status
                );
                const canRun = c.status === "promoted";

                return (
                  <tr key={c.id} className="hover:bg-[#0d0d1f] transition-colors">
                    <td className="py-2.5 pr-4 font-mono text-slate-200 text-xs max-w-xs truncate">
                      {c.keyword}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-500 text-xs truncate max-w-[100px]">
                      {c.seed ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="text-xs text-slate-400 bg-[#1a1a2e] px-1.5 py-0.5 rounded">
                        {c.track}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <ScoreBadge score={c.score} />
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[c.status] ?? "bg-slate-700 text-slate-300"}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canPromote && (
                          <form action={promoteBound}>
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded transition-colors"
                            >
                              Promote
                            </button>
                          </form>
                        )}
                        {canRun && (
                          <form action={runNextManual}>
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded transition-colors"
                            >
                              Run
                            </button>
                          </form>
                        )}
                        {canReject && (
                          <form action={rejectBound}>
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded transition-colors"
                            >
                              Reject
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
