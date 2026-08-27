import { API_BASE_URL } from "@/services/api";
import { openSSE } from "@/services/sse";
import type { ResumeBuddyStatusEvent } from "../types";

interface SubscribeHandlers {
  onEvent: (event: ResumeBuddyStatusEvent) => void;
  onError: (error: Error) => void;
}

/**
 * Subscribes to the backend Resume Buddy status stream for a job and forwards
 * each parsed event. The stream is authenticated (Bearer token) and closes
 * itself once a terminal event (stage "done" or status "failed") arrives.
 *
 * Returns a cleanup function that tears the connection down.
 */
export async function subscribeResumeBuddyStatus(
  jobId: string,
  { onEvent, onError }: SubscribeHandlers,
): Promise<() => void> {
  return openSSE<ResumeBuddyStatusEvent>(`${API_BASE_URL}/v1/resume/buddy/status/${jobId}`, {
    onEvent,
    onError,
    isTerminal: (event) => event.stage === "done" || event.status === "failed",
    defaultErrorMessage: "Lost connection to analysis stream",
  });
}
