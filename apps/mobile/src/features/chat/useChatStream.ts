import { useCallback, useRef, useState } from "react";
import EventSource, {
  type ErrorEvent,
  type ExceptionEvent,
  type MessageEvent,
  type TimeoutEvent,
} from "react-native-sse";
import { getAuthSession } from "@/services/auth-storage";
import { API_BASE_URL } from "@/services/api";
import { chatApi } from "@/services/chat-api";
import { useAppDispatch } from "@/store/hooks";

/**
 * SSE event payloads from POST /api/v1/chat/threads/{id}/messages/stream
 */
interface SSEStartEvent {
  event: "start";
  user_message_id: string;
  off_topic: boolean;
}

interface SSEChunkEvent {
  event: "chunk";
  content: string;
}

interface SSEDoneEvent {
  event: "done";
  assistant_message_id: string;
}

interface SSEErrorEvent {
  event: "error";
  detail: string;
}

type SSEPayload = SSEStartEvent | SSEChunkEvent | SSEDoneEvent | SSEErrorEvent;

export interface UseChatStreamReturn {
  /** Initiate an SSE streaming message send */
  sendStreamMessage: (threadId: string, content: string, quickActionId?: string) => void;
  /** The accumulated assistant reply text (grows with each chunk) */
  streamingContent: string;
  /** True while receiving SSE events */
  isStreaming: boolean;
  /** Error message from SSE error event or connection failure */
  streamError: string | null;
  /** User message ID returned by the "start" event */
  userMessageId: string | null;
  /** Assistant message ID returned by the "done" event */
  assistantMessageId: string | null;
  /** Reset the streaming state (clear content, error, etc.) */
  clearStream: () => void;
}

/**
 * Custom hook for SSE-streamed chat messaging.
 *
 * Uses the `react-native-sse` library (already in package.json) to handle
 * POST-based SSE with custom auth headers. This operates independently of
 * RTK Query — existing endpoints in chat-api.ts are NOT modified.
 *
 * After the stream finishes (done event), the hook dispatches an RTK Query
 * cache invalidation so `getChatMessages` refetches the finalized messages.
 */
export function useChatStream(): UseChatStreamReturn {
  const dispatch = useAppDispatch();
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [userMessageId, setUserMessageId] = useState<string | null>(null);
  const [assistantMessageId, setAssistantMessageId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const closedRef = useRef(false);

  const closeConnection = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (eventSourceRef.current) {
      eventSourceRef.current.removeAllEventListeners();
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const clearStream = useCallback(() => {
    closeConnection();
    closedRef.current = false;
    setStreamingContent("");
    setIsStreaming(false);
    setStreamError(null);
    setUserMessageId(null);
    setAssistantMessageId(null);
  }, [closeConnection]);

  const sendStreamMessage = useCallback(
    async (threadId: string, content: string, quickActionId?: string) => {
      // Reset state for the new stream
      closeConnection();
      closedRef.current = false;
      setStreamingContent("");
      setStreamError(null);
      setUserMessageId(null);
      setAssistantMessageId(null);
      setIsStreaming(true);

      try {
        const session = await getAuthSession();
        const token = session?.access_token;
        if (!token) {
          setStreamError("Not authenticated. Please log in again.");
          setIsStreaming(false);
          return;
        }

        const url = `${API_BASE_URL}/v1/chat/threads/${threadId}/messages/stream`;
        const body: Record<string, string | undefined> = { content };
        if (quickActionId) {
          body.quick_action_id = quickActionId;
        }

        const es = new EventSource(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify(body),
          pollingInterval: 0, // One-shot, no auto-reconnect
        });

        eventSourceRef.current = es;

        es.addEventListener("message", (event: MessageEvent) => {
          if (!event.data) return;

          let data: SSEPayload;
          try {
            data = JSON.parse(event.data) as SSEPayload;
          } catch {
            return; // Ignore non-JSON frames (keep-alive, etc.)
          }

          if (data.event === "start") {
            setUserMessageId(data.user_message_id);
          } else if (data.event === "chunk") {
            setStreamingContent((prev) => prev + data.content);
          } else if (data.event === "done") {
            setAssistantMessageId(data.assistant_message_id);
            setIsStreaming(false);
            closeConnection();

            // Invalidate RTK Query cache so getChatMessages refetches
            dispatch(chatApi.util.invalidateTags([{ type: "Chat", id: threadId }, "Chat"]));
          } else if (data.event === "error") {
            setStreamError(data.detail);
            setIsStreaming(false);
            closeConnection();
          }
        });

        es.addEventListener("error", (event: ErrorEvent | TimeoutEvent | ExceptionEvent) => {
          if (closedRef.current) return;
          const message =
            "message" in event && typeof event.message === "string"
              ? event.message
              : "Connection error. Please try again.";
          console.error("[useChatStream] SSE connection error:", message);
          setStreamError(message);
          setIsStreaming(false);
          closeConnection();
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to start streaming.";
        setStreamError(message);
        setIsStreaming(false);
      }
    },
    [dispatch, closeConnection],
  );

  return {
    sendStreamMessage,
    streamingContent,
    isStreaming,
    streamError,
    userMessageId,
    assistantMessageId,
    clearStream,
  };
}
