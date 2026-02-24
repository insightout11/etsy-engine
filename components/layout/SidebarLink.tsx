"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: string;
}

export default function SidebarLink({ href, label, icon }: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-600/30"
          : "text-slate-400 hover:bg-[#1a1a2e] hover:text-slate-200"
      }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
