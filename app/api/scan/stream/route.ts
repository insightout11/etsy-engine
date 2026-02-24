import { subscribeToProgress } from "@/lib/pipeline/progress-emitter";
import { prisma } from "@/lib/db/client";
import type { ProgressEvent } from "@/types/scan";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const scanIdStr = url.searchParams.get("scanId");

  if (!scanIdStr) {
    return new Response("Missing scanId", { status: 400 });
  }

  const scanId = parseInt(scanIdStr, 10);
  if (isNaN(scanId)) {
    return new Response("Invalid scanId", { status: 400 });
  }

  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      function send(event: ProgressEvent) {
        if (isClosed) return;
        try {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));

          // Close stream on terminal states
          if (
            event.phase === "complete" ||
            event.phase === "error" ||
            event.phase === "needs_review"
          ) {
            setTimeout(() => {
              if (!isClosed) {
                isClosed = true;
                controller.close();
              }
            }, 500);
          }
        } catch {
          // Stream already closed
        }
      }

      // Subscribe to in-memory events (fast path)
      unsubscribe = subscribeToProgress(scanId, send);

      // DB polling fallback: check current status on connect
      // (handles page refresh mid-scan)
      prisma.scan.findUnique({ where: { id: scanId } }).then((scan) => {
        if (!scan) return;
        if (
          scan.status === "complete" ||
          scan.status === "error" ||
          scan.status === "needs_review"
        ) {
          send({
            phase: scan.status as ProgressEvent["phase"],
            message:
              scan.status === "complete"
                ? "Brief ready"
                : scan.errorMessage ?? "Scan ended",
            progress: 100,
          });
        } else {
          // Send current status so the UI can resume from mid-scan
          send({
            phase: scan.status as ProgressEvent["phase"],
            message: `Resuming — current status: ${scan.status}`,
            progress: 0,
          });
        }
      });
    },

    cancel() {
      isClosed = true;
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
