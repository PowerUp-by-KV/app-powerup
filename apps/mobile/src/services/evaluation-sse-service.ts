/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL } from "@/services/api";
import { openSSE } from "@/services/sse";

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
  return openSSE<SSEStatusUpdate>(`${API_BASE_URL}/v1/activity/${skillType}/status/${responseId}`, {
    onEvent,
    onError,
    isTerminal: (event) => event.status === "COMPLETED" || event.status === "FAILED",
    defaultErrorMessage: "Connection to evaluation stream lost",
  });
}
