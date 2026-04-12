/**
 * src/constants/apiConfig.ts
 *
 * Single source of truth for ALL API configuration:
 *   • Base URLs
 *   • DevTunnel headers
 *   • Authorization (Bearer token)
 *   • Combined AUTH_HEADERS used by every slice
 *
 * ─── URL Architecture ────────────────────────────────────────────────────────
 *
 *  API_BASE_URL  →  https://host             (raw origin — WebSocket only)
 *  API_V1_URL    →  https://host/api/v1      (ALL REST endpoints)
 *
 * ─── Backend Contract (v3) ───────────────────────────────────────────────────
 *
 *  POST   /api/v1/upload                                  ← resume upload
 *  GET    /api/v1/parse/{resume_id}                       ← resume parse
 *  GET    /api/v1/practice/questions/start?user_id=...    ← practice question
 *  POST   /api/v1/practice/answer                         ← practice answer (FormData)
 *  POST   /api/v1/interviews/sessions                     ← start session
 *  GET    /api/v1/interviews/sessions                     ← list sessions
 *  POST   /api/v1/interviews/sessions/{id}/answer         ← submit answer (FormData)
 *  GET    /api/v1/interviews/sessions/{id}/result         ← get result
 *  POST   /api/v1/interviews/sessions/{id}/generate-report← generate report
 *  GET    /api/v1/interviews/report/{report_id}/pdf       ← download PDF
 */

import { Platform } from "react-native";
import Constants from "expo-constants";

// ── Mock API flag ─────────────────────────────────────────────────────────────

const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : false;

/**
 * USE_MOCK_API resolution order:
 *  1. EXPO_PUBLIC_USE_MOCK_API="false"  → always real backend (overrides __DEV__)
 *  2. EXPO_PUBLIC_USE_MOCK_API="true"   → always mock
 *  3. env var not set                   → fall back to __DEV__ (mock in dev builds)
 */
export const USE_MOCK_API: boolean =
  process.env.EXPO_PUBLIC_USE_MOCK_API === "false"
    ? false
    : process.env.EXPO_PUBLIC_USE_MOCK_API === "true"
      ? true
      : isDev;

// ── Base URLs ─────────────────────────────────────────────────────────────────

const stripSlash = (s: string) => s.replace(/\/$/, "");

const getHostUrl = (): string => {
  // Prefer the explicit env var (works on physical devices + DevTunnel)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return stripSlash(process.env.EXPO_PUBLIC_API_URL);
  }
  // Fallback for simulators / web
  if (Platform.OS === "web") return "http://127.0.0.1:8000";
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(":")[0] : "127.0.0.1";
  return `http://${host}:8000`;
};

/**
 * Raw server/tunnel origin — e.g. https://jbhkncl2-8000.inc1.devtunnels.ms
 * Only use this for WebSocket URL derivation (ws:// / wss://).
 * Use API_V1_URL for every REST call.
 */
export const API_BASE_URL: string = getHostUrl();

if (!process.env.EXPO_PUBLIC_API_URL && Platform.OS !== "web") {
  console.log(`📱 [apiConfig] Using dynamic host: ${API_BASE_URL}`);
}

/**
 * ALL REST endpoints live under /api/v1.
 * If EXPO_PUBLIC_API_V1_URL is set in .env it takes precedence, otherwise
 * we compute it from API_BASE_URL to guarantee no /api/v1/api/v1 duplicates.
 *
 * ⚠️  Safety: strip any trailing "/api/v1" from the base before appending,
 *     so a mis-configured env var cannot produce a double-prefix.
 */
const computeV1Url = (): string => {
  // If the convenience var is set, use it directly
  if (process.env.EXPO_PUBLIC_API_V1_URL) {
    return stripSlash(process.env.EXPO_PUBLIC_API_V1_URL);
  }
  // Build from base — but guard against accidental double-prefix
  const base = API_BASE_URL.replace(/\/api\/v1$/, ""); // strip if already present
  return `${base}/api/v1`;
};

export const API_V1_URL: string = computeV1Url();

/** @deprecated Use API_V1_URL — kept for backwards compat with existing slices. */
export const FULL_API_BASE_URL: string = API_V1_URL;

// ── DevTunnel header ──────────────────────────────────────────────────────────

/**
 * The DevTunnel authorization header value.
 * Reads from EXPO_PUBLIC_TUNNEL_HEADER, falls back to "tunnel <anonymous>".
 * Only injected when the URL contains ".devtunnels.ms".
 */
const TUNNEL_HEADER_VALUE: string = process.env.EXPO_PUBLIC_TUNNEL_HEADER ?? "tunnel <anonymous>";

export const DEVTUNNEL_HEADERS: Record<string, string> = API_BASE_URL.includes(".devtunnels.ms")
  ? { "X-Tunnel-Authorization": TUNNEL_HEADER_VALUE }
  : {};

// ── Authorization (Bearer token) ──────────────────────────────────────────────

/**
 * Auth token for the `Authorization: Bearer <token>` header.
 *
 * Priority:
 *  1. EXPO_PUBLIC_AUTH_TOKEN env var  (dev / DevTunnel testing)
 *  2. Empty string                    (backend not enforcing auth yet)
 *
 * When a proper login flow is added, replace this with a call to
 * your token store (AsyncStorage / SecureStore / Redux selector).
 */
export const AUTH_TOKEN: string = process.env.EXPO_PUBLIC_AUTH_TOKEN ?? "";

/**
 * AUTH_HEADERS — inject these into EVERY API call (RTK prepareHeaders + fetch).
 *
 * Contains:
 *   • Authorization: Bearer <token>    (required by backend)
 *   • X-Tunnel-Authorization: tunnel   (required by DevTunnel)
 *
 * If AUTH_TOKEN is empty the Authorization header is still sent as
 * "Bearer " (empty token) which is intentional — it lets the backend
 * return a proper 401 rather than a tunnel block or network error.
 */
export const AUTH_HEADERS: Record<string, string> = {
  Authorization: `Bearer ${AUTH_TOKEN}`,
  ...DEVTUNNEL_HEADERS,
};

// ── Sanity log (dev only) ─────────────────────────────────────────────────────

if (isDev) {
  console.log("[apiConfig] API_V1_URL   :", API_V1_URL);
  console.log(
    "[apiConfig] AUTH_TOKEN   :",
    AUTH_TOKEN ? "✅ set" : "⚠️  empty — fill EXPO_PUBLIC_AUTH_TOKEN in .env",
  );
  console.log(
    "[apiConfig] DEVTUNNEL    :",
    Object.keys(DEVTUNNEL_HEADERS).length ? "✅ active" : "off",
  );
}
