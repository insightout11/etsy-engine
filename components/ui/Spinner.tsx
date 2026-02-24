export default function Spinner({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-4 w-4" : size === "md" ? "h-6 w-6" : "h-8 w-8";
  return (
    <div
      className={`${sz} animate-spin rounded-full border-2 border-slate-600 border-t-indigo-400`}
    />
  );
}
