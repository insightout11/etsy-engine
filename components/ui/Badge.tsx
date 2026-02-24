type BadgeVariant = "build" | "kill" | "hold" | "needs_review" | "complete" | "error" | "default";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  build: "bg-green-900/40 text-green-400 border-green-700/40",
  kill: "bg-red-900/40 text-red-400 border-red-700/40",
  hold: "bg-yellow-900/40 text-yellow-400 border-yellow-700/40",
  needs_review: "bg-orange-900/40 text-orange-400 border-orange-700/40",
  complete: "bg-indigo-900/40 text-indigo-400 border-indigo-700/40",
  error: "bg-red-900/40 text-red-400 border-red-700/40",
  default: "bg-slate-800 text-slate-400 border-slate-700",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${VARIANT_STYLES[variant]}`}
    >
      {children}
    </span>
  );
}
