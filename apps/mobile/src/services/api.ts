import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getAuthSession } from "./auth-storage";
import type { ResumeParsedData } from "@app-powerup/shared/types";

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
    "Resume",
  ],
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
