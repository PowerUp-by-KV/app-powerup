/**
 * src/features/interview/hooks/useLiveIndicators.ts
 *
 * Production-grade WebSocket hook for real-time live indicators with polling fallback.
 *
 * Features:
 *  - Auto-connects on mount
 *  - Auto-reconnects on disconnection (up to MAX_RECONNECT_ATTEMPTS)
 *  - Falls back to RTK Query polling when WebSocket is not connected
 *  - Reconnects when app returns from background
 *  - Reconnects when network is restored (requires @react-native-community/netinfo)
 *  - Proper cleanup to prevent memory leaks
 *  - Strict TypeScript — no `any`
 *  - No duplicate connections
 *
 * NOTE: For network-restore reconnection, install:
 *   pnpm add @react-native-community/netinfo
 *   expo install @react-native-community/netinfo
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { logger } from "@/utils/logger";
import { API_BASE_URL } from "@/constants/apiConfig";
import type { LiveIndicators } from "../types/interview.types";
import { useGetLiveIndicatorsQuery } from "../services/interviewFeedbackApi";

// ── Optional NetInfo import ───────────────────────────────────────────────────

/** Typed minimal interface for the NetInfo module we need. */
interface NetInfoModule {
  addEventListener: (callback: (state: { isConnected: boolean | null }) => void) => () => void;
}

let netInfoModule: NetInfoModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  netInfoModule = require("@react-native-community/netinfo").default as NetInfoModule;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (_err) {
  logger.warn(
    "NetInfo not available. Install @react-native-community/netinfo for network reconnection support.",
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 3000;

// ── Normalizer ────────────────────────────────────────────────────────────────

/**
 * Safely maps a raw WebSocket payload to LiveIndicators.
 * Accepts both camelCase and snake_case fields from the server.
 * Defaults numeric fields to 0 rather than propagating NaN when a
 * field is absent or arrives as the wrong type.
 */
function normaliseWsPayload(raw: Record<string, unknown>): LiveIndicators {
  const num = (camel: string, snake: string): number => {
    const value = raw[camel] ?? raw[snake];
    return typeof value === "number" ? value : 0;
  };

  return {
    speakingPace: num("speakingPace", "speaking_pace"),
    clarity: num("clarity", "clarity"),
    fillerCount: num("fillerCount", "filler_count"),
    confidence: num("confidence", "confidence"),
    // Prefer server timestamp; fall back to local time if absent or non-numeric.
    timestamp: num("timestamp", "timestamp") || Date.now(),
  };
}

// ── Type guard ────────────────────────────────────────────────────────────────

/**
 * Confirms a parsed value is an object that carries at least one of the
 * required numeric live-indicator fields. We normalise after this guard,
 * so we only need to know the message is broadly the right shape.
 */
function isLiveIndicatorsPayload(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj["speakingPace"] === "number" ||
    typeof obj["speaking_pace"] === "number" ||
    typeof obj["clarity"] === "number" ||
    typeof obj["fillerCount"] === "number" ||
    typeof obj["filler_count"] === "number"
  );
}

// ── Interfaces ────────────────────────────────────────────────────────────────

interface UseLiveIndicatorsOptions {
  sessionId: string;
  questionId: string;
  enableWebSocket?: boolean;
}

interface UseLiveIndicatorsReturn {
  indicators: LiveIndicators | null;
  isConnected: boolean;
  connectionType: "websocket" | "polling";
  isLoading: boolean;
  error: string | null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLiveIndicators({
  sessionId,
  questionId,
  enableWebSocket = true,
}: UseLiveIndicatorsOptions): UseLiveIndicatorsReturn {
  // ── State (only values that drive UI) ──────────────────────────────────────
  const [indicators, setIndicators] = useState<LiveIndicators | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  /**
   * Ref mirror of `isConnected` — lets the AppState handler read the live
   * value without being stale due to the effect's closed-over snapshot.
   */
  const isConnectedRef = useRef(false);
  const [connectionType, setConnectionType] = useState<"websocket" | "polling">("polling");
  const [wsLoading, setWsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Refs (internal bookkeeping — never drive renders) ───────────────────────
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateSubscriptionRef = useRef<ReturnType<typeof AppState.addEventListener> | null>(null);
  const netInfoUnsubscribeRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);
  const isReconnectingRef = useRef(false);
  /** Tracks the previous AppState value without triggering re-renders. */
  const prevAppStateRef = useRef<AppStateStatus>("active");
  /** Tracks network connectivity without triggering re-renders. */
  const isNetworkConnectedRef = useRef(true);

  // ── RTK Query polling fallback ─────────────────────────────────────────────
  // Polling is active only when the WebSocket is not connected.
  // isFetching from RTK Query contributes to the loading state.
  const { data: polledData, isFetching } = useGetLiveIndicatorsQuery(
    { sessionId, questionId },
    {
      // Skip the query when:
      //  • WS is already feeding us data
      //  • WS is explicitly disabled
      //  • IDs are not yet available (avoids a 400/404 on the initial render)
      skip: isConnected || !enableWebSocket || !sessionId || !questionId,
      pollingInterval: 2000,
    },
  );

  // Keep isConnectedRef in sync so AppState/NetInfo handlers read a fresh value.
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  // Sync polled data into indicators state when WebSocket is down.
  useEffect(() => {
    if (polledData && !isConnected && mountedRef.current) {
      setIndicators(polledData);
      setConnectionType("polling");
      setWsLoading(false);
      setError(null);
    }
  }, [polledData, isConnected]);

  // ── connectWebSocket ───────────────────────────────────────────────────────
  // Defined before reconnectWebSocket so the reference is stable.

  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || !mountedRef.current) return;
    // Do not attempt a connection if the caller hasn't provided valid IDs yet.
    if (!sessionId || !questionId) return;

    try {
      // Derive the WebSocket base URL from the same API_BASE_URL used by
      // RTK Query — this keeps dev/staging/prod configs in one place.
      // http(s)://host → ws(s)://host
      const wsBase = API_BASE_URL.replace(/^https?/, "ws");
      const url = `${wsBase}/ws/interview/${sessionId}/${questionId}`;

      logger.log("Connecting to WebSocket:", url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        logger.log("WebSocket connected successfully");
        if (!mountedRef.current) return;
        setIsConnected(true);
        setConnectionType("websocket");
        setError(null);
        setWsLoading(false);
        reconnectAttemptsRef.current = 0;
        isReconnectingRef.current = false;
      };

      ws.onmessage = (event: WebSocketMessageEvent) => {
        try {
          const parsed: unknown = JSON.parse(event.data as string);
          if (!mountedRef.current) return;

          if (isLiveIndicatorsPayload(parsed)) {
            // Safely map both camelCase and snake_case server payloads.
            // All numeric fields are defaulted to 0 — never NaN.
            setIndicators(normaliseWsPayload(parsed));
            setWsLoading(false);
          } else {
            logger.warn("WebSocket received unrecognised message shape:", parsed);
          }
        } catch (err) {
          logger.error("Failed to parse WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        // WebSocket error events carry no useful message in React Native.
        // onclose always fires immediately after onerror, so all connection
        // state updates (setIsConnected, setConnectionType) live there to
        // avoid scheduling the same state change twice in one event loop tick.
        logger.error("WebSocket error occurred");
        if (!mountedRef.current) return;
        setError("Connection error. Using polling fallback.");
      };

      ws.onclose = () => {
        logger.log("WebSocket closed");
        // Guard: only handle the close event for the ws instance we tracked.
        if (!mountedRef.current || wsRef.current !== ws) return;

        // Clear the reconnect guard here (and in onopen) instead of using a
        // fixed timeout — outcome is now known so the guard can be released.
        isReconnectingRef.current = false;

        setIsConnected(false);
        setConnectionType("polling");

        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current += 1;
          logger.log(
            `WebSocket reconnect attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}`,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connectWebSocket();
            }
          }, RECONNECT_DELAY_MS);
        } else {
          logger.log("Max reconnect attempts reached. Staying on polling fallback.");
          setError("WebSocket unavailable. Using polling fallback.");
        }
      };

      wsRef.current = ws;
    } catch (err) {
      logger.error("Failed to create WebSocket:", err);
      if (!mountedRef.current) return;
      setError("WebSocket unavailable. Using polling fallback.");
      setIsConnected(false);
      setConnectionType("polling");
    }
  }, [sessionId, questionId, enableWebSocket]);

  // ── reconnectWebSocket ─────────────────────────────────────────────────────
  // Closes any existing connection, resets retry counter, and re-connects.

  const reconnectWebSocket = useCallback(() => {
    if (isReconnectingRef.current) {
      logger.log("Reconnection already in progress, skipping");
      return;
    }
    if (!enableWebSocket || !mountedRef.current) return;

    logger.log("Initiating WebSocket reconnection");

    // Show loading state again while the new connection is being established.
    setWsLoading(true);

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (err) {
        logger.error("Error closing WebSocket before reconnect:", err);
      }
      wsRef.current = null;
    }

    reconnectAttemptsRef.current = 0;
    isReconnectingRef.current = true;

    connectWebSocket();
    // isReconnectingRef is cleared inside ws.onopen and ws.onclose once the
    // outcome is known, rather than using a fixed timeout that may fire before
    // the handshake completes on slow connections.
  }, [enableWebSocket, connectWebSocket]);

  // ── Cleanup ────────────────────────────────────────────────────────────────

  const cleanup = useCallback(() => {
    logger.log("Cleaning up useLiveIndicators");

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (err) {
        logger.error("Error closing WebSocket during cleanup:", err);
      }
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (appStateSubscriptionRef.current) {
      appStateSubscriptionRef.current.remove();
      appStateSubscriptionRef.current = null;
    }

    if (netInfoUnsubscribeRef.current) {
      netInfoUnsubscribeRef.current();
      netInfoUnsubscribeRef.current = null;
    }
  }, []);

  // ── Mount effect: initial connection ───────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true;
    if (enableWebSocket) {
      connectWebSocket();
    } else {
      // WebSocket is disabled (e.g. IDs not yet available) — clear the
      // initial wsLoading=true so isLoading doesn't stay true forever.
      setWsLoading(false);
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [connectWebSocket, cleanup, enableWebSocket]);

  // ── AppState effect: reconnect when app foregrounds ────────────────────────
  // Uses a ref for prevAppState so this effect is registered exactly once.

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const wasBackground = /inactive|background/.test(prevAppStateRef.current);
      const isNowActive = nextAppState === "active";

      // Use the ref so we always read the live connection value, not the
      // snapshot captured when this effect first registered the handler.
      if (wasBackground && isNowActive && enableWebSocket && !isConnectedRef.current) {
        logger.log("App returned to foreground — attempting WebSocket reconnection");
        reconnectWebSocket();
      }

      prevAppStateRef.current = nextAppState;
    };

    appStateSubscriptionRef.current = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      appStateSubscriptionRef.current?.remove();
      appStateSubscriptionRef.current = null;
    };
    // enableWebSocket and reconnectWebSocket are stable (useCallback with stable deps).
    // isConnected is read inside the handler via closure; the handler is registered once
    // and the ref for prevAppState prevents stale-closure issues on prev value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── NetInfo effect: reconnect when network is restored ────────────────────

  useEffect(() => {
    if (!enableWebSocket || !netInfoModule) return;

    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = netInfoModule.addEventListener((state) => {
        const wasOffline = !isNetworkConnectedRef.current;
        const isNowOnline = state.isConnected === true;

        if (wasOffline && isNowOnline) {
          logger.log("Network restored — attempting WebSocket reconnection");
          reconnectWebSocket();
        }

        isNetworkConnectedRef.current = isNowOnline;
      });

      netInfoUnsubscribeRef.current = unsubscribe;
    } catch (err) {
      logger.warn("Failed to setup NetInfo listener:", err);
    }

    return () => {
      netInfoUnsubscribeRef.current?.();
      netInfoUnsubscribeRef.current = null;
    };
  }, [enableWebSocket, reconnectWebSocket]);

  // ── Return value ───────────────────────────────────────────────────────────
  // isLoading is true until EITHER the WebSocket OR the polling fallback has
  // delivered its first data point. isFetching is included so screens show a
  // loading indicator during the very first polling request.

  return {
    indicators,
    isConnected,
    connectionType,
    isLoading: (wsLoading && !indicators) || isFetching,
    error,
  };
}
