import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Platform } from "react-native";
import { router } from "expo-router";
import { getAuthSession, saveAuthSession, clearAuthSession } from "./auth-storage";

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallbackDevBaseUrl = __DEV__ ? "http://localhost:8000/api" : undefined;

export function normalizeBaseUrlForRuntime(url: string): string {
  if (Platform.OS !== "android") {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.hostname = "10.0.2.2";
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

const resolvedBaseUrl = rawBaseUrl || fallbackDevBaseUrl;
const BASE_URL = resolvedBaseUrl ? normalizeBaseUrlForRuntime(resolvedBaseUrl) : undefined;

if (!BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL environment variable is required. " +
      "Please set it in your .env file. For local development, use: http://localhost:8000/api",
  );
}

export const API_BASE_URL = BASE_URL as string;

export function resolveApiAssetUrl(url?: string | null): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;

  try {
    const parsed = new URL(API_BASE_URL);
    const origin = `${parsed.protocol}//${parsed.host}`;
    return `${origin}${url.startsWith("/") ? url : `/${url}`}`;
  } catch {
    return url;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const currentSession = await getAuthSession();
    if (currentSession?.refresh_token) {
      const refreshResp = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: currentSession.refresh_token }),
      });
      if (refreshResp.ok) {
        const refreshed = await refreshResp.json();
        const newAccessToken = refreshed.access_token;
        await saveAuthSession({
          ...currentSession,
          access_token: newAccessToken,
          refresh_token: refreshed.refresh_token ?? currentSession.refresh_token,
        });
        return newAccessToken;
      }
    }
  } catch (error) {
    console.warn("Failed to refresh access token:", error);
  }
  return null;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: async (headers) => {
    try {
      headers.set("X-Tunnel-Skip-AntiPhishing-Page", "true");
      const session = await getAuthSession();
      if (session?.access_token) {
        headers.set("Authorization", `Bearer ${session.access_token}`);
      }
    } catch (error) {
      console.warn("Failed to get auth token for API request:", error);
    }
    return headers;
  },
});

let isRedirectingToLogin = false;

// Wipe the session and send the user to /login. Only call this for a genuine
// auth failure (the refresh token is invalid/expired), never for a transient
// network/5xx/timeout error — otherwise a flaky or cold-starting backend would
// log users out and bounce them back to login right after a successful sign-in.
async function forceLogout(): Promise<void> {
  await clearAuthSession();
  if (!isRedirectingToLogin) {
    isRedirectingToLogin = true;
    router.replace("/login");
    setTimeout(() => {
      isRedirectingToLogin = false;
    }, 1000);
  }
}

// On 401: try refresh once, update stored session, retry original request.
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const session = await getAuthSession().catch(() => null);
    if (session?.refresh_token) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/v1/auth/refresh",
          method: "POST",
          body: { refresh_token: session.refresh_token },
        },
        api,
        extraOptions,
      );

      if (refreshResult.data) {
        const refreshed = refreshResult.data as { access_token: string; refresh_token?: string };
        await saveAuthSession({
          ...session,
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token ?? session.refresh_token,
        });
        // Retry the original request with the new token.
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed. Only log out if the refresh token was genuinely
        // rejected (401/403). For transient failures (network error, timeout,
        // 5xx — e.g. a cold-starting backend) keep the session and let the
        // request be retried; otherwise we'd bounce a just-logged-in user out.
        const refreshStatus = refreshResult.error?.status;
        if (refreshStatus === 401 || refreshStatus === 403) {
          await forceLogout();
        }
      }
    } else {
      // The access token was rejected (401) and there is no refresh token to
      // recover with — the session can't be salvaged, so log out.
      await forceLogout();
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Grammar",
    "Reading",
    "Listening",
    "Results",
    "Onboarding",
    "Assessment",
    "Resume",
    "Modules",
    "Chat",
    "Achievements",
    "Leaderboard",
    "Friends",
    "Subscription",
    "Avatars",
    "PracticeHistory",
    "InterviewPlayground",
  ] as const,
  endpoints: () => ({}),
});
