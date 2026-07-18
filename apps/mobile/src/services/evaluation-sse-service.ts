/* eslint-disable @typescript-eslint/no-explicit-any */
import EventSource, {
  type ErrorEvent,
  type ExceptionEvent,
  type MessageEvent,
  type TimeoutEvent,
} from "react-native-sse";

import { API_BASE_URL } from "@/services/api";
import { getAuthSession } from "@/services/auth-storage";

export interface SSEStatusUpdate {
  response_id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  score?: number | null;
  feedback?: string | null;
  score_breakdown?: any | null;
}

interface SubscribeHandlers {
  onEvent: (event: SSEStatusUpdate) => void;
  onError: (error: Error) => void;
}

/**
 * Subscribes to the backend activity status stream (speaking or writing) for a response_id.
 * The stream is authenticated (Bearer token) and closes itself once a terminal event
 * ("completed" or "failed") arrives.
 *
 * Returns a cleanup function that tears the connection down.
 */
export async function subscribeToEvaluationStatus(
  responseId: string,
  skillType: "speaking" | "writing",
  { onEvent, onError }: SubscribeHandlers,
): Promise<() => void> {
  const session = await getAuthSession();
  const token = session?.access_token;
  if (!token) {
    onError(new Error("Not authenticated"));
    return () => {};
  }

  const url = `${API_BASE_URL}/v1/activity/${skillType}/status/${responseId}`;
  const es = new EventSource(url, {
    headers: { Authorization: `Bearer ${token}` },
    pollingInterval: 0, // don't auto-reconnect after server closes the completed stream
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
    let parsed: SSEStatusUpdate;
    try {
      parsed = JSON.parse(event.data) as SSEStatusUpdate;
    } catch {
      return; // ignore keep-alive / non-JSON frames
    }

    onEvent(parsed);

    if (parsed.status === "COMPLETED" || parsed.status === "FAILED") {
      close();
    }
  });

  es.addEventListener("error", (event: ErrorEvent | TimeoutEvent | ExceptionEvent) => {
    if (closed) return;
    const message =
      "message" in event && typeof event.message === "string"
        ? event.message
        : "Connection to evaluation stream lost";
    onError(new Error(message));
  });

  return close;
}
