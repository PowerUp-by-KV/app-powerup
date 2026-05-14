import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthSession } from "./auth-storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  throw new Error("EXPO_PUBLIC_API_URL environment variable is required...");
}

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
  tagTypes: [
    "Grammar",
    "Reading",
    "Listening",
    "Behavior",
    "Streak",
    "Quests",
    "User",
    "Leaderboard",
    "Results",
    "Skills",
    "Auth",
    "Assessment",
  ],
  endpoints: () => ({}),
});
