import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { getAuthSession } from "./auth-storage";

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallbackDevBaseUrl = __DEV__ ? "http://localhost:8000/api" : undefined;

function normalizeBaseUrlForRuntime(url: string): string {
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

console.log("API Base URL:", BASE_URL);

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: async (headers) => {
      try {
        const session = await getAuthSession();
        if (session?.access_token) {
          headers.set("Authorization", `Bearer ${session.access_token}`);
        }
      } catch (error) {
        console.warn("Failed to get auth token for API request:", error);
      }
      return headers;
    },
  }),
  tagTypes: ["Auth", "Grammar", "Reading", "Listening", "Results", "Onboarding", "Assessment"],
  endpoints: () => ({}),
});
