import { EventEmitter } from "events";
import type { ProgressEvent } from "@/types/scan";

// In-memory event emitter keyed by scanId
// Works for local dev; SSE route subscribes and forwards to browser
const emitter = new EventEmitter();
emitter.setMaxListeners(100);

export type ProgressEmitter = (event: ProgressEvent) => void;

export function emitProgress(scanId: number): ProgressEmitter {
  return (event: ProgressEvent) => {
    emitter.emit(`scan:${scanId}`, event);
  };
}

export function subscribeToProgress(
  scanId: number,
  handler: (event: ProgressEvent) => void
): () => void {
  const key = `scan:${scanId}`;
  emitter.on(key, handler);
  return () => emitter.off(key, handler);
}
