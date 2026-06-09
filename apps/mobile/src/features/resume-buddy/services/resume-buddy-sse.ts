import EventSource, {
  type ErrorEvent,
  type ExceptionEvent,
  type MessageEvent,
  type TimeoutEvent,
} from "react-native-sse";

import { API_BASE_URL } from "@/services/api";
import { getAuthSession } from "@/services/auth-storage";
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
  const session = await getAuthSession();
  const token = session?.access_token;
  if (!token) {
    onError(new Error("Not authenticated"));
    return () => {};
  }

  const url = `${API_BASE_URL}/v1/resume/buddy/status/${jobId}`;
  const es = new EventSource(url, {
    headers: { Authorization: `Bearer ${token}` },
    // The stream is one-shot per job; don't let the client auto-reconnect after
    // the server closes a completed stream.
    pollingInterval: 0,
  });

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    es.removeAllEventListeners();
    es.close();
  };

  es.addEventListener("message", (event: MessageEvent) => {
    if (!event.data) return;
    let parsed: ResumeBuddyStatusEvent;
    try {
      parsed = JSON.parse(event.data) as ResumeBuddyStatusEvent;
    } catch {
      return; // ignore keep-alive / non-JSON frames
    }
    onEvent(parsed);
    if (parsed.stage === "done" || parsed.status === "failed") {
      close();
    }
  });

  es.addEventListener("error", (event: ErrorEvent | TimeoutEvent | ExceptionEvent) => {
    if (closed) return;
    const message =
      "message" in event && typeof event.message === "string"
        ? event.message
        : "Lost connection to analysis stream";
    onError(new Error(message));
  });

  return close;
}
