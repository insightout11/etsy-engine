import { prisma } from "@/lib/db/client";
import BriefsList from "@/components/briefs/BriefsList";

export const dynamic = "force-dynamic";

export default async function BriefsPage() {
  const scans = await prisma.scan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      decision: true,
      brief: { select: { qaJson: true, id: true } },
    },
  });

  const rows = scans.map((scan) => {
    let qaWarnings = 0;
    if (scan.brief?.qaJson) {
      try {
        const qa = JSON.parse(scan.brief.qaJson) as { issues: Array<{ severity: string }> };
        qaWarnings = qa.issues?.filter((i) => i.severity === "error").length ?? 0;
      } catch { /* ignore */ }
    }

    return {
      id: scan.id,
      keyword: scan.keyword,
      createdAt: scan.createdAt.toISOString(),
      status: scan.status,
      decision: scan.decision?.decision ?? null,
      hasBrief: !!scan.brief,
      qaWarnings,
    };
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Scan History</h1>
        <p className="text-sm text-slate-500 mt-1">{scans.length} scans total</p>
      </div>
      <BriefsList rows={rows} />
    </div>
  );
}
