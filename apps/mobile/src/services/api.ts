import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ResumeParsedData, ResumeUploadResponse } from "@app-powerup/shared";

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
    // POST /api/resume/upload - Upload PDF and parse resume
    uploadResume: builder.mutation<ResumeUploadResponse, FormData>({
      query: (formData) => ({
        url: "/resume/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Resume"],
    }),

    // GET /api/resume/{user_id} - Get user's resume
    getResume: builder.query<ResumeParsedData, string>({
      query: (userId) => `/resume/${userId}`,
      providesTags: ["Resume"],
    }),

    // PUT /api/resume/{user_id} - Update resume
    updateResume: builder.mutation<ResumeParsedData, { userId: string; data: ResumeParsedData }>({
      query: ({ userId, data }) => ({
        url: `/resume/${userId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Resume"],
    }),

    // DELETE /api/resume/{user_id} - Delete resume
    deleteResume: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/resume/${userId}`,
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
