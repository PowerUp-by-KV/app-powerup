import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthSession } from "./auth-storage";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? "http://localhost:8000/api" : undefined);

if (!BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL environment variable is required. " +
      "Please set it in your .env file. For local development, use: http://localhost:8000/api",
  );
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
  tagTypes: ["Auth", "Grammar", "Reading", "Listening", "Results", "Onboarding"],
  endpoints: () => ({}),
});
