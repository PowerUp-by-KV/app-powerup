import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ResumeParsedData } from "@app-powerup/shared";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // TODO: Attach auth token from secure storage
      return headers;
    },
  }),
  tagTypes: ["Resume"],
  endpoints: (builder) => ({
    // Upload PDF and parse resume
    uploadResume: builder.mutation<ResumeParsedData, FormData>({
      query: (formData) => ({
        url: "/v1/resume/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Resume"],
    }),

    // Get user's resume
    getResume: builder.query<ResumeParsedData, string>({
      query: (userId) => `/v1/resume/${userId}`,
      providesTags: ["Resume"],
    }),

    // Update resume
    updateResume: builder.mutation<ResumeParsedData, { userId: string; data: ResumeParsedData }>({
      query: ({ userId, data }) => ({
        url: `/v1/resume/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Resume"],
    }),

    // Delete resume
    deleteResume: builder.mutation<void, string>({
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
