"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export default function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-2 py-1 rounded bg-[#1a1a2e] border border-[#2d2d4e] text-slate-400 hover:text-slate-200 hover:border-indigo-500 transition-colors"
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}
