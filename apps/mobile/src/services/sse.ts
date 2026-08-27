import EventSource, {
  type ErrorEvent,
  type ExceptionEvent,
  type MessageEvent,
  type TimeoutEvent,
} from "react-native-sse";

import { getAuthSession } from "@/services/auth-storage";

interface OpenSSEHandlers<T> {
  onEvent: (event: T) => void;
  onError: (error: Error) => void;
  /** Return true once a terminal event has arrived, so the connection self-closes. */
  isTerminal: (event: T) => boolean;
  /** Message shown for a bare connection-error event with no detail of its own. */
  defaultErrorMessage: string;
}

/**
 * Opens an authenticated, one-shot GET SSE subscription: connects with the
 * current bearer token, parses each message as JSON, and closes itself once
 * isTerminal(event) is true or the server errors. Shared by
 * evaluation-sse-service.ts and resume-buddy-sse.ts, which had identical
 * connect/parse/close/error boilerplate differing only in the URL and
 * terminal-event predicate.
 *
 * Returns a cleanup function that tears the connection down early (e.g. on
 * unmount) - callers must still await this before assuming a connection.
 */
export async function openSSE<T>(
  url: string,
  { onEvent, onError, isTerminal, defaultErrorMessage }: OpenSSEHandlers<T>,
): Promise<() => void> {
  const session = await getAuthSession();
  const token = session?.access_token;
  if (!token) {
    onError(new Error("Not authenticated"));
    return () => {};
  }

  const es = new EventSource(url, {
    headers: { Authorization: `Bearer ${token}` },
    pollingInterval: 0, // don't auto-reconnect after the server closes a completed stream
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
    let parsed: T;
    try {
      parsed = JSON.parse(event.data) as T;
    } catch {
      return; // ignore keep-alive / non-JSON frames
    }

    onEvent(parsed);

    if (isTerminal(parsed)) {
      close();
    }
  });

  es.addEventListener("error", (event: ErrorEvent | TimeoutEvent | ExceptionEvent) => {
    if (closed) return;
    const message =
      "message" in event && typeof event.message === "string" ? event.message : defaultErrorMessage;
    onError(new Error(message));
  });

  return close;
}
