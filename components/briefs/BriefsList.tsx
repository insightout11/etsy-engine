"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";

interface BriefRow {
  id: number;
  keyword: string;
  createdAt: string;
  status: string;
  decision: string | null;
  hasBrief: boolean;
  qaWarnings: number;
}

interface BriefsListProps {
  rows: BriefRow[];
}

type Filter = "all" | "build" | "kill" | "hold" | "pending";

export default function BriefsList({ rows }: BriefsListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = rows.filter((row) => {
    const matchesSearch = row.keyword.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "pending") return !row.decision;
    return row.decision === filter;
  });

  return (
    <div className="space-y-4">
      {/* Filters + search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {(["all", "build", "kill", "hold", "pending"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-[#1a1a2e] text-slate-400 hover:text-slate-200 border border-[#2d2d4e]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto px-3 py-1.5 text-sm bg-[#1a1a2e] border border-[#2d2d4e] rounded text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-64"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No scans match the current filter.
        </div>
      ) : (
        <div className="border border-[#2d2d4e] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2d2d4e] bg-[#0d0d1f]">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Keyword
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Decision
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`border-b border-[#2d2d4e] last:border-0 hover:bg-[#1a1a2e] transition-colors ${
                    idx % 2 === 0 ? "" : "bg-[#0d0d1f]/50"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-200">{row.keyword}</div>
                    {row.qaWarnings > 0 && (
                      <div className="text-xs text-yellow-500 mt-0.5">
                        ⚠ {row.qaWarnings} QA {row.qaWarnings === 1 ? "error" : "errors"}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        row.status === "complete"
                          ? "complete"
                          : row.status === "error"
                          ? "error"
                          : row.status === "needs_review"
                          ? "needs_review"
                          : "default"
                      }
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {row.decision ? (
                      <Badge
                        variant={row.decision as "build" | "kill" | "hold"}
                      >
                        {row.decision}
                      </Badge>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.hasBrief ? (
                      <Link
                        href={`/briefs/${row.id}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        View →
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-600">No brief</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
