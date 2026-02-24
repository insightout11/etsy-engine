"use client";

import { useState } from "react";

export default function AdvancedOptions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-[#2d2d4e] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-400 hover:text-slate-200 hover:bg-[#1a1a2e] transition-colors"
      >
        <span>Advanced options</span>
        <span className="text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-4 py-4 border-t border-[#2d2d4e] bg-[#0d0d1f] space-y-5">
          {/* Sample size */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Listings to analyze
            </label>
            <div className="flex gap-3">
              {[20, 50, 100].map((n) => (
                <label key={n} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sampleSize"
                    value={n}
                    defaultChecked={n === 50}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm text-slate-300">{n}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reviews toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-400">Include buyer reviews</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Fetches reviews for top 10 listings to populate Buyer Frictions
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="includeReviews"
                value="on"
                defaultChecked={true}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-[#2d2d4e] rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform" />
            </label>
          </div>

          {/* Detail depth */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Fetch depth
            </label>
            <div className="flex gap-3">
              {(["standard", "deep"] as const).map((depth) => (
                <label key={depth} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="detailDepth"
                    value={depth}
                    defaultChecked={depth === "standard"}
                    className="accent-indigo-500"
                  />
                  <span className="text-sm text-slate-300 capitalize">{depth}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Region / Language (optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Region (optional)
              </label>
              <input
                type="text"
                name="region"
                placeholder="e.g. US"
                className="w-full px-3 py-2 text-sm bg-[#1a1a2e] border border-[#2d2d4e] rounded text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Language (optional)
              </label>
              <input
                type="text"
                name="language"
                placeholder="e.g. en-US"
                className="w-full px-3 py-2 text-sm bg-[#1a1a2e] border border-[#2d2d4e] rounded text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Force refresh */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="forceRefresh"
              value="on"
              className="accent-indigo-500"
            />
            <div>
              <div className="text-xs font-medium text-slate-400">Force refresh cache</div>
              <div className="text-xs text-slate-500">Re-fetch listings even if cached within 24h</div>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
