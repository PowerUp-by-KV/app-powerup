import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Platform } from "react-native";
import { getAuthSession } from "./auth-storage";
import type { ResumeParsedData } from "@app-powerup/shared/types";

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
  tagTypes: ["Auth", "Grammar", "Reading", "Listening", "Results", "Onboarding", "Assessment", "Resume"],
  endpoints: (builder) => ({
    // Upload Resume PDF
    uploadResume: builder.mutation<{ data: ResumeParsedData; message: string }, FormData>({
      query: (formData) => ({
        url: "/v1/resume/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Resume"],
    }),

    // Get Resume by User ID
    getResume: builder.query<ResumeParsedData, string>({
      query: (userId) => `/v1/resume/${userId}`,
      providesTags: ["Resume"],
    }),

    // Update Resume
    updateResume: builder.mutation<
      { data: ResumeParsedData; message: string },
      { userId: string; data: ResumeParsedData }
    >({
      query: ({ userId, data }) => ({
        url: `/v1/resume/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Resume"],
    }),

    // Delete Resume
    deleteResume: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/v1/resume/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Resume"],
    }),
  }),
});

export const {
  useUploadResumeMutation,
  useGetResumeQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
} = api;
