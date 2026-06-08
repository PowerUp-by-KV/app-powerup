import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Platform } from "react-native";
import { getAuthSession, saveAuthSession } from "./auth-storage";

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
      }
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
