interface WarningsBoxProps {
  warnings: string[];
}

export default function WarningsBox({ warnings }: WarningsBoxProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="p-4 bg-yellow-900/20 border border-yellow-700/40 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-yellow-400 text-sm">⚠</span>
        <span className="text-sm font-medium text-yellow-300">
          {warnings.length === 1 ? "Warning" : `${warnings.length} warnings`}
        </span>
      </div>
      <ul className="space-y-1">
        {warnings.map((w, i) => (
          <li key={i} className="text-xs text-yellow-200/70">
            {w}
          </li>
        ))}
      </ul>
    </div>
  );
}
