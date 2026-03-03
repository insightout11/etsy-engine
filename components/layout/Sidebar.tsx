import Link from "next/link";
import SidebarLink from "./SidebarLink";

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#0d0d1f] border-r border-[#2d2d4e] h-screen z-10">
      {/* Logo / Brand */}
      <Link href="/" className="px-5 py-5 border-b border-[#2d2d4e] block hover:bg-[#12122b] transition-colors">
        <div className="text-sm font-bold text-indigo-300 tracking-wide uppercase">
          Etsy Engine
        </div>
        <div className="text-xs text-slate-400 mt-0.5">Module 1 · Edge Analyzer</div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarLink href="/" label="Home" icon="🏠" />
        <SidebarLink href="/queue" label="Queue" icon="🔍" />
        <SidebarLink href="/scan" label="Scan" icon="⚡" />
        <SidebarLink href="/briefs" label="History" icon="📋" />
      </nav>

      {/* Keyboard shortcut hints */}
      <div className="px-4 py-4 border-t border-[#2d2d4e]">
        <div className="text-xs text-slate-500 font-medium mb-2 uppercase tracking-wide">
          Shortcuts
        </div>
        <div className="space-y-1">
          {[
            ["⌘↵", "Run scan"],
            ["B", "Build"],
            ["K", "Kill"],
            ["H", "Hold"],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1a1a2e] border border-[#2d2d4e] rounded text-slate-400">
                {key}
              </kbd>
              <span className="text-[11px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
